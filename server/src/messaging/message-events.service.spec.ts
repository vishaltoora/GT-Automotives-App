import { MessageEventsService } from './message-events.service';

describe('MessageEventsService', () => {
  let events: MessageEventsService;

  beforeEach(() => {
    events = new MessageEventsService();
  });

  afterEach(() => {
    events.onModuleDestroy();
  });

  const publish = (overrides: Partial<Parameters<typeof events.publish>[0]>) =>
    events.publish({
      conversationId: 'conv-1',
      mentionedUserIds: [],
      visibility: 'PUBLIC' as const,
      authorId: 'someone-else',
      ...overrides,
    });

  it('wakes a reader when a public message lands', async () => {
    const waiting = events.waitForMessage('sarah-1', 1000);
    publish({});

    await expect(waiting).resolves.toBe(true);
  });

  // A public message in another thread does wake you, deliberately: it moves
  // your unread count, which is the badge's whole job. What must not wake you
  // is a private message you are not part of.
  it('does not wake for a private message you are not in', async () => {
    const waiting = events.waitForMessage('sarah-1', 60);
    publish({
      conversationId: 'conv-2',
      mentionedUserIds: ['mike-1'],
      visibility: 'MENTIONED_ONLY',
    });

    await expect(waiting).resolves.toBe(false);
  });

  // A tagged message must reach its target even when they are looking at
  // something else — that is the whole point of the mentions badge.
  it('wakes a tagged user with no thread open', async () => {
    const waiting = events.waitForMessage('sarah-1', 1000);
    publish({
      conversationId: 'conv-9',
      mentionedUserIds: ['sarah-1'],
      visibility: 'MENTIONED_ONLY',
    });

    await expect(waiting).resolves.toBe(true);
  });

  it('does not wake someone who was not tagged', async () => {
    const waiting = events.waitForMessage('mike-1', 60);
    publish({
      conversationId: 'conv-9',
      mentionedUserIds: ['sarah-1'],
      visibility: 'MENTIONED_ONLY',
    });

    await expect(waiting).resolves.toBe(false);
  });

  it('does not wake the author for their own message', async () => {
    const waiting = events.waitForMessage('sarah-1', 60);
    publish({ authorId: 'sarah-1' });

    await expect(waiting).resolves.toBe(false);
  });

  it('resolves false once the wait elapses', async () => {
    await expect(events.waitForMessage('sarah-1', 40)).resolves.toBe(false);
  });

  it('wakes every reader of a public message', async () => {
    const first = events.waitForMessage('sarah-1', 1000);
    const second = events.waitForMessage('mike-1', 1000);
    publish({});

    await expect(Promise.all([first, second])).resolves.toEqual([true, true]);
  });

  // A held request that left its listener behind would leak one per poll.
  it('removes its listener whether it wakes or times out', async () => {
    const woken = events.waitForMessage('sarah-1', 1000);
    publish({});
    await woken;

    await events.waitForMessage('sarah-1', 30);

    expect(events['emitter'].listenerCount('message')).toBe(0);
  });

  it('settles only once when several messages arrive', async () => {
    const waiting = events.waitForMessage('sarah-1', 1000);
    publish({});
    publish({});
    publish({});

    await expect(waiting).resolves.toBe(true);
    expect(events['emitter'].listenerCount('message')).toBe(0);
  });

  /*
   * The badge poll runs with no conversation open, so before this an untagged
   * message in shop chat woke nobody: the reader sat out the full hold and the
   * count stayed wrong for up to twenty-five seconds, and the sound never
   * fired because the count never moved.
   */
  describe('public messages', () => {
    it('wakes a reader with no thread open', async () => {
      const waiting = events.waitForMessage('sarah-1', 1000);
      publish({ conversationId: 'general-1', mentionedUserIds: [] });

      await expect(waiting).resolves.toBe(true);
    });

    it('wakes a reader sitting in another thread', async () => {
      const waiting = events.waitForMessage('sarah-1', 1000);
      publish({ conversationId: 'general-1', mentionedUserIds: [] });

      await expect(waiting).resolves.toBe(true);
    });

    it('still does not wake the author of it', async () => {
      const waiting = events.waitForMessage('sarah-1', 60);
      publish({
        conversationId: 'general-1',
        mentionedUserIds: [],
        authorId: 'sarah-1',
      });

      await expect(waiting).resolves.toBe(false);
    });

    // Waking is not reading: a private message must still only reach the
    // people tagged in it, which the poll re-checks after any wake-up.
    it('does not widen who a private message wakes', async () => {
      const waiting = events.waitForMessage('mike-1', 60);
      publish({
        conversationId: 'conv-1',
        mentionedUserIds: ['sarah-1'],
        visibility: 'MENTIONED_ONLY',
      });

      await expect(waiting).resolves.toBe(false);
    });

    /*
     * A message tagging nobody but its own author is stored MENTIONED_ONLY
     * with an empty audience — the author is taken out of their own mention
     * list. Reading "public" off that empty list woke the whole shop for a
     * message only one person can see.
     */
    it('does not wake anyone for a note somebody tagged themselves in', async () => {
      const waiting = events.waitForMessage('mike-1', 60);
      publish({
        conversationId: 'conv-1',
        mentionedUserIds: [],
        visibility: 'MENTIONED_ONLY',
      });

      await expect(waiting).resolves.toBe(false);
    });

    /*
     * Sitting in the thread used to be enough to be woken by a private message
     * in it. The poll then returned nothing, so no content leaked — but the
     * early return still told an outsider that something had just been said
     * where they could not see it. An admin watching shop chat is exactly the
     * case that made this worth closing.
     */
    it('does not wake a bystander watching the thread it lands in', async () => {
      const waiting = events.waitForMessage('admin-1', 60);
      publish({
        conversationId: 'conv-1',
        mentionedUserIds: ['sarah-1'],
        visibility: 'MENTIONED_ONLY',
      });

      await expect(waiting).resolves.toBe(false);
    });
  });
});
