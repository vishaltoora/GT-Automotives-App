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
      authorId: 'someone-else',
      ...overrides,
    });

  it('wakes a reader when a message lands in the thread they have open', async () => {
    const waiting = events.waitForMessage('sarah-1', 'conv-1', 1000);
    publish({});

    await expect(waiting).resolves.toBe(true);
  });

  it('does not wake for a different thread', async () => {
    const waiting = events.waitForMessage('sarah-1', 'conv-1', 60);
    publish({ conversationId: 'conv-2' });

    await expect(waiting).resolves.toBe(false);
  });

  // A tagged message must reach its target even when they are looking at
  // something else — that is the whole point of the mentions badge.
  it('wakes a tagged user with no thread open', async () => {
    const waiting = events.waitForMessage('sarah-1', undefined, 1000);
    publish({ conversationId: 'conv-9', mentionedUserIds: ['sarah-1'] });

    await expect(waiting).resolves.toBe(true);
  });

  it('does not wake someone who was not tagged, in a thread they are not in', async () => {
    const waiting = events.waitForMessage('mike-1', undefined, 60);
    publish({ conversationId: 'conv-9', mentionedUserIds: ['sarah-1'] });

    await expect(waiting).resolves.toBe(false);
  });

  it('does not wake the author for their own message', async () => {
    const waiting = events.waitForMessage('sarah-1', 'conv-1', 60);
    publish({ authorId: 'sarah-1' });

    await expect(waiting).resolves.toBe(false);
  });

  it('resolves false once the wait elapses', async () => {
    await expect(events.waitForMessage('sarah-1', 'conv-1', 40)).resolves.toBe(
      false
    );
  });

  it('wakes every reader of the same thread', async () => {
    const first = events.waitForMessage('sarah-1', 'conv-1', 1000);
    const second = events.waitForMessage('mike-1', 'conv-1', 1000);
    publish({});

    await expect(Promise.all([first, second])).resolves.toEqual([true, true]);
  });

  // A held request that left its listener behind would leak one per poll.
  it('removes its listener whether it wakes or times out', async () => {
    const woken = events.waitForMessage('sarah-1', 'conv-1', 1000);
    publish({});
    await woken;

    await events.waitForMessage('sarah-1', 'other', 30);

    expect(events['emitter'].listenerCount('message')).toBe(0);
  });

  it('settles only once when several messages arrive', async () => {
    const waiting = events.waitForMessage('sarah-1', 'conv-1', 1000);
    publish({});
    publish({});
    publish({});

    await expect(waiting).resolves.toBe(true);
    expect(events['emitter'].listenerCount('message')).toBe(0);
  });
});
