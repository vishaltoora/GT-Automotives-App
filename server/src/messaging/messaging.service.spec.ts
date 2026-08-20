import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { MessageRepository } from './repositories/message.repository';

/**
 * The thing worth guarding here is who can read a message.
 *
 * Tagging somebody makes a message private, so the derivation of that flag is
 * a security decision, not a formatting one. Every test below is a way of
 * getting it wrong: trusting the client, trusting the token, or letting a
 * reply escape the privacy of what it replies to.
 */
describe('MessagingService', () => {
  let service: MessagingService;
  let prisma: any;
  let messages: jest.Mocked<Partial<MessageRepository>>;

  const author = { id: 'author-1', role: { name: 'STAFF' } };

  const internalUsers = [
    { id: 'sarah-1' },
    { id: 'mike-1' },
    { id: 'author-1' },
  ];

  /** Captures what actually reached the database. */
  let createdMessage: any;

  const messageRow = (overrides: any = {}) => ({
    id: 'msg-1',
    conversationId: 'conv-1',
    parentMessageId: null,
    authorId: author.id,
    body: 'hello',
    visibility: 'PUBLIC',
    author: { id: author.id, firstName: 'Vishal', lastName: 'T' },
    mentions: [],
    references: [],
    createdAt: new Date('2026-08-20T17:00:00.000Z'),
    editedAt: null,
    deletedAt: null,
    ...overrides,
  });

  beforeEach(() => {
    createdMessage = undefined;

    const tx = {
      message: {
        create: jest.fn().mockImplementation(({ data }) => {
          createdMessage = data;
          return Promise.resolve(
            messageRow({ body: data.body, visibility: data.visibility })
          );
        }),
        update: jest.fn().mockImplementation(({ data }) => {
          createdMessage = data;
          return Promise.resolve(
            messageRow({ body: data.body, visibility: data.visibility })
          );
        }),
      },
      messageMention: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
      messageReference: {
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
      conversation: { update: jest.fn().mockResolvedValue({}) },
    };

    prisma = {
      $transaction: jest.fn((fn: any) => fn(tx)),
      conversation: {
        findUnique: jest.fn().mockResolvedValue({ id: 'conv-1' }),
        findFirst: jest.fn().mockResolvedValue({ id: 'conv-1' }),
        create: jest.fn(),
      },
      conversationMember: {
        upsert: jest.fn().mockResolvedValue({}),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      user: {
        findMany: jest.fn().mockImplementation(({ where }) => {
          const ids: string[] = where?.id?.in ?? [];
          return Promise.resolve(
            internalUsers.filter((u) => ids.includes(u.id))
          );
        }),
      },
      message: { update: jest.fn().mockResolvedValue({}) },
      messageMention: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        findFirst: jest.fn().mockResolvedValue({ id: 'mention-1' }),
      },
      repairOrder: { findMany: jest.fn().mockResolvedValue([]) },
    };

    messages = {
      findByIdForUser: jest.fn(),
      findForConversation: jest.fn().mockResolvedValue([]),
      countUnreadMentions: jest.fn().mockResolvedValue(0),
      unreadCountsByConversation: jest.fn().mockResolvedValue({}),
    };

    service = new MessagingService(prisma, messages as never);
  });

  const send = (body: string, parentMessageId?: string) =>
    service.createMessage('conv-1', author, { body, parentMessageId });

  describe('deriving visibility from the body', () => {
    it('leaves an untagged message public', async () => {
      await send('rear brakes are done');

      expect(createdMessage.visibility).toBe('PUBLIC');
      expect(createdMessage.mentions.create).toEqual([]);
    });

    it('makes a tagged message private to that person', async () => {
      await send('@[Sarah](user:sarah-1) please order 4 Michelins');

      expect(createdMessage.visibility).toBe('MENTIONED_ONLY');
      expect(createdMessage.mentions.create).toEqual([{ userId: 'sarah-1' }]);
    });

    it('makes two tags an audience of both', async () => {
      await send('@[Sarah](user:sarah-1) @[Mike](user:mike-1) sort this out');

      expect(createdMessage.visibility).toBe('MENTIONED_ONLY');
      expect(createdMessage.mentions.create).toEqual([
        { userId: 'sarah-1' },
        { userId: 'mike-1' },
      ]);
    });

    it('does not create a mention row for the author tagging themselves', async () => {
      await send('@[Me](user:author-1) note to self');

      expect(createdMessage.mentions.create).toEqual([]);
    });
  });

  describe('what the client is not allowed to decide', () => {
    // The DTO has no visibility field, but a client can always send extra keys.
    it('ignores a visibility sent by the client', async () => {
      await service.createMessage('conv-1', author, {
        body: '@[Sarah](user:sarah-1) parts please',
        visibility: 'PUBLIC',
      } as never);

      expect(createdMessage.visibility).toBe('MENTIONED_ONLY');
    });

    it('ignores a mention list sent by the client', async () => {
      await service.createMessage('conv-1', author, {
        body: 'nothing tagged here',
        mentions: [{ userId: 'mike-1' }],
      } as never);

      expect(createdMessage.visibility).toBe('PUBLIC');
      expect(createdMessage.mentions.create).toEqual([]);
    });

    // Otherwise anyone could paste a token for an id that is not a colleague
    // and hand themselves — or a customer — sight of the thread.
    it('drops a token for someone who is not an active internal user', async () => {
      await send('@[Ghost](user:not-a-user) hello');

      expect(createdMessage.visibility).toBe('PUBLIC');
      expect(createdMessage.mentions.create).toEqual([]);
    });

    it('keeps the real tags when a forged one rides alongside', async () => {
      await send('@[Sarah](user:sarah-1) @[Ghost](user:not-a-user) hi');

      expect(createdMessage.mentions.create).toEqual([{ userId: 'sarah-1' }]);
    });
  });

  describe('replies inherit privacy', () => {
    it('keeps an untagged reply to a private message private', async () => {
      (messages.findByIdForUser as jest.Mock).mockResolvedValue(
        messageRow({
          id: 'parent-1',
          authorId: 'mike-1',
          visibility: 'MENTIONED_ONLY',
          mentions: [{ userId: 'sarah-1', user: {} }],
        })
      );

      await send('on it', 'parent-1');

      expect(createdMessage.visibility).toBe('MENTIONED_ONLY');
    });

    it('carries the parent audience so the thread stays readable to them', async () => {
      (messages.findByIdForUser as jest.Mock).mockResolvedValue(
        messageRow({
          id: 'parent-1',
          authorId: 'mike-1',
          visibility: 'MENTIONED_ONLY',
          mentions: [{ userId: 'sarah-1', user: {} }],
        })
      );

      await send('on it', 'parent-1');

      expect(createdMessage.mentions.create).toEqual(
        expect.arrayContaining([{ userId: 'sarah-1' }, { userId: 'mike-1' }])
      );
    });

    it('leaves a reply to a public message public', async () => {
      (messages.findByIdForUser as jest.Mock).mockResolvedValue(
        messageRow({ id: 'parent-1', visibility: 'PUBLIC' })
      );

      await send('agreed', 'parent-1');

      expect(createdMessage.visibility).toBe('PUBLIC');
    });

    it('refuses to reply to a message the user cannot see', async () => {
      (messages.findByIdForUser as jest.Mock).mockResolvedValue(null);

      await expect(send('sneaky', 'parent-1')).rejects.toThrow(
        NotFoundException
      );
    });

    it('refuses to reply across conversations', async () => {
      (messages.findByIdForUser as jest.Mock).mockResolvedValue(
        messageRow({ id: 'parent-1', conversationId: 'other-conv' })
      );

      await expect(send('wrong thread', 'parent-1')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('editing', () => {
    it('re-derives visibility, so removing the tag makes it public', async () => {
      (messages.findByIdForUser as jest.Mock).mockResolvedValue(
        messageRow({ visibility: 'MENTIONED_ONLY', authorId: author.id })
      );

      await service.updateMessage('msg-1', author, 'never mind, all done');

      expect(createdMessage.visibility).toBe('PUBLIC');
    });

    it('refuses to edit somebody else’s message', async () => {
      (messages.findByIdForUser as jest.Mock).mockResolvedValue(
        messageRow({ authorId: 'mike-1' })
      );

      await expect(
        service.updateMessage('msg-1', author, 'edited')
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleting', () => {
    it('soft deletes rather than removing the row', async () => {
      (messages.findByIdForUser as jest.Mock).mockResolvedValue(
        messageRow({ authorId: author.id })
      );

      await service.deleteMessage('msg-1', author);

      expect(prisma.message.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ deletedAt: expect.any(Date) }),
        })
      );
    });

    it('refuses to delete somebody else’s message', async () => {
      (messages.findByIdForUser as jest.Mock).mockResolvedValue(
        messageRow({ authorId: 'mike-1' })
      );

      await expect(service.deleteMessage('msg-1', author)).rejects.toThrow(
        ForbiddenException
      );
    });

    it('lets an admin delete anyone’s message', async () => {
      (messages.findByIdForUser as jest.Mock).mockResolvedValue(
        messageRow({ authorId: 'mike-1' })
      );

      await expect(
        service.deleteMessage('msg-1', {
          id: 'admin-1',
          role: { name: 'ADMIN' },
        })
      ).resolves.toBeUndefined();
    });
  });

  describe('mentionable users', () => {
    it('asks only for active internal users, never customers', async () => {
      prisma.user.findMany.mockResolvedValue([]);

      await service.findMentionableUsers('sa');

      const where = prisma.user.findMany.mock.calls.at(-1)[0].where;
      expect(where.isActive).toBe(true);
      expect(where.role.name.in).not.toContain('CUSTOMER');
      expect(where.role.name.in).toEqual(
        expect.arrayContaining(['ADMIN', 'STAFF', 'FOREMAN'])
      );
    });
  });

  describe('poll', () => {
    it('returns a serverTime for the client to send back as the cursor', async () => {
      const result = await service.poll(author, 'conv-1');

      expect(result.serverTime).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(result.messages).toEqual([]);
    });

    it('reports counts even with no thread open', async () => {
      (messages.countUnreadMentions as jest.Mock).mockResolvedValue(3);

      const result = await service.poll(author);

      expect(result.unreadMentions).toBe(3);
      expect(messages.findForConversation).not.toHaveBeenCalled();
    });

    it('emits createdAt as a real instant, not a business date', async () => {
      (messages.findForConversation as jest.Mock).mockResolvedValue([
        messageRow(),
      ]);

      const result = await service.poll(author, 'conv-1');

      expect(result.messages[0].createdAt).toBe('2026-08-20T17:00:00.000Z');
    });
  });
});
