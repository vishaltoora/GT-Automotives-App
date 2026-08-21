import { renderHook, waitFor } from '@testing-library/react';
import { useMessagePolling } from './useMessagePolling';
import { pollMessages } from '../../../requests/messaging.requests';

jest.mock('../../../requests/messaging.requests', () => ({
  pollMessages: jest.fn(),
}));

const mockPoll = pollMessages as jest.MockedFunction<typeof pollMessages>;

describe('useMessagePolling', () => {
  let hidden = false;

  beforeEach(() => {
    jest.clearAllMocks();
    hidden = false;
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => hidden,
    });
    mockPoll.mockResolvedValue({
      messages: [],
      unreadMentions: 0,
      conversationUnreads: {},
      serverTime: '2026-08-21T17:00:00.000Z',
    });
  });

  it('asks once without a hold before settling into holding', async () => {
    renderHook(() => useMessagePolling('conv-1'));

    await waitFor(() => expect(mockPoll).toHaveBeenCalled());
    expect(mockPoll.mock.calls[0][0].waitMs).toBeUndefined();

    await waitFor(
      () =>
        expect(
          mockPoll.mock.calls.some((call) => call[0].waitMs === 25_000)
        ).toBe(true),
      { timeout: 3000 }
    );
  });

  /*
   * A backgrounded tab used to stop asking altogether, so nothing could tell
   * anybody a message had arrived while they were somewhere else — which is
   * the only moment being told is worth anything.
   */
  it('keeps asking while the tab is hidden, without holding a connection', async () => {
    hidden = true;

    renderHook(() => useMessagePolling('conv-1'));

    await waitFor(() => expect(mockPoll).toHaveBeenCalled());
    expect(mockPoll.mock.calls.every((call) => !call[0].waitMs)).toBe(true);
  });
});
