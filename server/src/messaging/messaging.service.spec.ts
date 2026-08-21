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
  let events: { publish: jest.Mock; waitForMessage: jest.Mock };

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
      $transaction: jest.fn((arg: any) =>
        typeof arg === 'function' ? arg(tx) : Promise.all(arg)
      ),
      conversation: {
        findUnique: jest.fn().mockResolvedValue({ id: 'conv-1' }),
        findFirst: jest.fn().mockResolvedValue({ id: 'conv-1' }),
        create: jest.fn(),
      },
      conversationMember: {
        upsert: jest.fn().mockResolvedValue({}),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        findUnique: jest.fn().mockResolvedValue({ lastReadAt: null }),
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
      countUnreadMentionsOutsideMemberships: jest.fn().mockResolvedValue(0),
    };

    events = {
      publish: jest.fn(),
      waitForMessage: jest.fn().mockResolvedValue(false),
    };

    service = new MessagingService(prisma, messages as never, events as never);
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

    /*
     * Delete reach is bounded by what the admin can read: findByIdForUser
     * applies the visibility filter, so a private message they are not part of
     * never gets this far — it 404s instead.
     */
    it('lets an admin delete any message they can see', async () => {
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

    /*
     * A message that tags you is both an unread mention and an unread message
     * in its conversation. Adding the two fields showed two of everything on
     * the badge, so the total is counted here instead: once per conversation,
     * plus the tags waiting in threads this reader has never opened and so has
     * no membership in.
     */
    it('counts each unread message once, not once per reason', async () => {
      (messages.countUnreadMentions as jest.Mock).mockResolvedValue(2);
      (messages.unreadCountsByConversation as jest.Mock).mockResolvedValue({
        'conv-1': 2,
        'conv-2': 1,
      });
      (
        messages.countUnreadMentionsOutsideMemberships as jest.Mock
      ).mockResolvedValue(0);

      const result = await service.poll(author);

      expect(result.unreadTotal).toBe(3);
    });

    it('adds tags waiting in threads the reader has never opened', async () => {
      (messages.unreadCountsByConversation as jest.Mock).mockResolvedValue({
        'conv-1': 1,
      });
      (
        messages.countUnreadMentionsOutsideMemberships as jest.Mock
      ).mockResolvedValue(2);

      const result = await service.poll(author);

      // Those two have no membership to be counted against, and they are the
      // whole point of the mention badge.
      expect(result.unreadTotal).toBe(3);
    });

    it('emits createdAt as a real instant, not a business date', async () => {
      (messages.findForConversation as jest.Mock).mockResolvedValue([
        messageRow(),
      ]);

      const result = await service.poll(author, 'conv-1');

      expect(result.messages[0].createdAt).toBe('2026-08-20T17:00:00.000Z');
    });
  });

  describe('long polling', () => {
    it('returns at once when the caller asks for no wait', async () => {
      await service.poll(author, 'conv-1', undefined, 0);

      expect(events.waitForMessage).not.toHaveBeenCalled();
    });

    it('does not hold when there is already something to return', async () => {
      (messages.findForConversation as jest.Mock).mockResolvedValue([
        messageRow(),
      ]);

      await service.poll(author, 'conv-1', undefined, 25_000);

      expect(events.waitForMessage).not.toHaveBeenCalled();
    });

    it('holds when there is nothing new', async () => {
      await service.poll(author, 'conv-1', undefined, 25_000);

      expect(events.waitForMessage).toHaveBeenCalledWith(author.id, 25_000);
    });

    // The proxy in front of this gives up at 30s, so a longer hold would
    // surface to the browser as an error instead of an empty result.
    it('caps the hold below the reverse proxy timeout', async () => {
      await service.poll(author, 'conv-1', undefined, 120_000);

      expect(events.waitForMessage).toHaveBeenCalledWith(author.id, 25_000);
    });

    // Waking says something happened, not that this user may read it.
    it('re-queries through the visibility filter after waking', async () => {
      events.waitForMessage.mockResolvedValue(true);
      (messages.findForConversation as jest.Mock)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([messageRow()]);

      const result = await service.poll(author, 'conv-1', undefined, 25_000);

      expect(messages.findForConversation).toHaveBeenCalledTimes(2);
      expect(result.messages).toHaveLength(1);
    });

    /*
     * Returning the pre-wait answer on a timeout handed back counts up to
     * twenty-five seconds old, which is how a message in shop chat could sit
     * unannounced on somebody else's screen.
     */
    it('re-queries on timeout rather than returning the pre-wait answer', async () => {
      events.waitForMessage.mockResolvedValue(false);
      (messages.findForConversation as jest.Mock)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([messageRow()]);

      const result = await service.poll(author, 'conv-1', undefined, 25_000);

      expect(messages.findForConversation).toHaveBeenCalledTimes(2);
      expect(result.messages).toHaveLength(1);
    });
  });

  describe('announcing writes', () => {
    it('publishes so held requests wake', async () => {
      await send('@[Sarah](user:sarah-1) parts please');

      expect(events.publish).toHaveBeenCalledWith({
        conversationId: 'conv-1',
        mentionedUserIds: ['sarah-1'],
        // Carried so the wake predicate reads the visibility the row was
        // stored with rather than guessing it from an empty audience.
        visibility: 'MENTIONED_ONLY',
        authorId: author.id,
      });
    });

    it('publishes for a public message too', async () => {
      await send('rear brakes done');

      expect(events.publish).toHaveBeenCalledWith(
        expect.objectContaining({ mentionedUserIds: [], visibility: 'PUBLIC' })
      );
    });
  });

  describe('mention inbox', () => {
    const inboxRow = (conversation: any) => ({
      id: 'mention-1',
      readAt: null,
      message: {
        ...messageRow(),
        conversation,
      },
    });

    /*
     * A mention is read from the inbox, away from the thread it was written
     * in, so it has to say which job it is about or it is just a sentence with
     * no context.
     */
    it('carries the repair order number of the thread it came from', async () => {
      (messages.findMentionInbox as jest.Mock) = jest.fn().mockResolvedValue([
        inboxRow({
          id: 'conv-1',
          entityType: 'REPAIR_ORDER',
          entityId: 'ro-1',
        }),
      ]);
      prisma.repairOrder.findMany.mockResolvedValue([
        { id: 'ro-1', roNumber: 'RO-202608-0002' },
      ]);

      const inbox = await service.getMentionInbox(author, false);

      expect(inbox[0].conversation.roNumber).toBe('RO-202608-0002');
      expect(inbox[0].conversation.entityId).toBe('ro-1');
    });

    it('leaves the number null for a mention from shop chat', async () => {
      (messages.findMentionInbox as jest.Mock) = jest
        .fn()
        .mockResolvedValue([
          inboxRow({ id: 'conv-2', entityType: null, entityId: null }),
        ]);

      const inbox = await service.getMentionInbox(author, false);

      expect(inbox[0].conversation.roNumber).toBeNull();
      expect(prisma.repairOrder.findMany).not.toHaveBeenCalled();
    });

    it('looks up each repair order once however many mentions it has', async () => {
      (messages.findMentionInbox as jest.Mock) = jest
        .fn()
        .mockResolvedValue([
          inboxRow({ id: 'c1', entityType: 'REPAIR_ORDER', entityId: 'ro-1' }),
          inboxRow({ id: 'c1', entityType: 'REPAIR_ORDER', entityId: 'ro-1' }),
          inboxRow({ id: 'c2', entityType: 'REPAIR_ORDER', entityId: 'ro-2' }),
        ]);
      prisma.repairOrder.findMany.mockResolvedValue([
        { id: 'ro-1', roNumber: 'RO-1' },
        { id: 'ro-2', roNumber: 'RO-2' },
      ]);

      await service.getMentionInbox(author, false);

      expect(prisma.repairOrder.findMany).toHaveBeenCalledTimes(1);
      const ids = prisma.repairOrder.findMany.mock.calls[0][0].where.id.in;
      expect(ids.sort()).toEqual(['ro-1', 'ro-2']);
    });

    it('survives a repair order that has since been deleted', async () => {
      (messages.findMentionInbox as jest.Mock) = jest.fn().mockResolvedValue([
        inboxRow({
          id: 'conv-1',
          entityType: 'REPAIR_ORDER',
          entityId: 'gone',
        }),
      ]);
      prisma.repairOrder.findMany.mockResolvedValue([]);

      const inbox = await service.getMentionInbox(author, false);

      expect(inbox[0].conversation.roNumber).toBeNull();
    });
  });

  describe('marking a conversation read', () => {
    /*
     * The badge used to lie. Somebody tagged in a repair order would open that
     * thread, read the message, and still be told they had an unread mention,
     * because the only thing that cleared one was clicking it in the inbox.
     */
    it('clears the mentions in that conversation, not just the read mark', async () => {
      await service.markConversationRead('conv-1', author.id);

      expect(prisma.messageMention.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId: author.id,
            readAt: null,
            message: { conversationId: 'conv-1' },
          },
        })
      );
    });

    it('moves the read mark forward', async () => {
      await service.markConversationRead('conv-1', author.id);

      expect(prisma.conversationMember.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { conversationId: 'conv-1', userId: author.id },
          data: { lastReadAt: expect.any(Date) },
        })
      );
    });

    // Half of this applied would leave the two counts disagreeing.
    it('does both in one transaction', async () => {
      await service.markConversationRead('conv-1', author.id);

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    });

    it('leaves other conversations alone', async () => {
      await service.markConversationRead('conv-1', author.id);

      const where = prisma.messageMention.updateMany.mock.calls.at(-1)[0].where;
      expect(where.message.conversationId).toBe('conv-1');
      expect(where.userId).toBe(author.id);
    });
  });
});
