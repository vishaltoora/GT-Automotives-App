import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MessageThread } from './MessageThread';

const mockGetEntityThread = jest.fn();
const mockPollMessages = jest.fn();

jest.mock('../../requests/messaging.requests', () => ({
  getEntityThread: (...args: unknown[]) => mockGetEntityThread(...args),
  getGeneralThread: jest.fn(),
  pollMessages: (...args: unknown[]) => mockPollMessages(...args),
  sendMessage: jest.fn(),
  deleteMessage: jest.fn(),
  markConversationRead: jest.fn().mockResolvedValue(undefined),
  searchMentionableUsers: jest.fn().mockResolvedValue([]),
  searchReferenceableROs: jest.fn().mockResolvedValue([]),
}));

/*
 * Mirrors the real contexts, which build a fresh object of fresh arrow
 * functions on every render rather than memoising. That unstable identity is
 * the thing these tests exist to survive.
 */
jest.mock('../../contexts/ErrorContext', () => ({
  useErrorHelpers: () => ({
    showApiError: (error: unknown) => void error,
  }),
}));

jest.mock('../../contexts/ConfirmationContext', () => ({
  useConfirmationHelpers: () => ({
    confirmDelete: () => Promise.resolve(false),
  }),
}));

const renderThread = () =>
  render(
    <MemoryRouter>
      <MessageThread
        entityType="REPAIR_ORDER"
        entityId="ro-1"
        currentUserId="user-1"
        isAdmin={false}
      />
    </MemoryRouter>
  );

describe('MessageThread', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetEntityThread.mockResolvedValue({ id: 'conv-1' });
    mockPollMessages.mockResolvedValue({
      messages: [],
      unreadMentions: 0,
      conversationUnreads: {},
      serverTime: '2026-08-20T17:00:00.000Z',
    });
  });

  /*
   * The bug this guards against: naming a context helper in a dependency array
   * made the effect re-run on every render, so opening the thread set state,
   * which re-rendered, which opened it again. On screen it looked like the tab
   * refreshing forever; in the network tab it was an unbounded request loop.
   *
   * Nothing in typecheck or lint can see this, which is how it reached a
   * browser in the first place.
   */
  it('opens the conversation once, not on every render', async () => {
    renderThread();

    await waitFor(() => expect(mockGetEntityThread).toHaveBeenCalled());
    // Long enough for a runaway loop to show itself.
    await new Promise((resolve) => setTimeout(resolve, 250));

    expect(mockGetEntityThread).toHaveBeenCalledTimes(1);
    expect(mockGetEntityThread).toHaveBeenCalledWith('REPAIR_ORDER', 'ro-1');
  });

  it('settles instead of re-rendering forever', async () => {
    renderThread();

    await waitFor(() =>
      expect(screen.getByText('No messages yet')).toBeTruthy()
    );

    const pollsAfterSettling = mockPollMessages.mock.calls.length;
    await new Promise((resolve) => setTimeout(resolve, 250));

    // A held poll plus the initial catch-up is fine; a loop is not.
    expect(
      mockPollMessages.mock.calls.length - pollsAfterSettling
    ).toBeLessThan(3);
  });

  it('shows an error rather than an empty thread when opening fails', async () => {
    mockGetEntityThread.mockRejectedValue(new Error('nope'));

    renderThread();

    await waitFor(() =>
      expect(
        screen.getByText('This conversation could not be opened.')
      ).toBeTruthy()
    );
    expect(mockGetEntityThread).toHaveBeenCalledTimes(1);
  });
});
