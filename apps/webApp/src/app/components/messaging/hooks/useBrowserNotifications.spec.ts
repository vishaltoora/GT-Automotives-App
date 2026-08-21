import { act, renderHook } from '@testing-library/react';
import { useBrowserNotifications } from './useBrowserNotifications';

/**
 * The rules worth pinning down are the ones about restraint: this thing is
 * allowed to interrupt somebody, so every case where it must not is a test.
 */
describe('useBrowserNotifications', () => {
  const shown: Array<{ title: string; options?: NotificationOptions }> = [];
  let hidden = true;

  class FakeNotification {
    static permission: NotificationPermission = 'granted';
    static requestPermission = jest.fn(async () => FakeNotification.permission);

    onclick: (() => void) | null = null;
    close = jest.fn();

    constructor(title: string, options?: NotificationOptions) {
      shown.push({ title, options });
    }
  }

  beforeEach(() => {
    shown.length = 0;
    hidden = true;
    FakeNotification.permission = 'granted';
    (window as unknown as { Notification: unknown }).Notification =
      FakeNotification;
    localStorage.clear();

    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => hidden,
    });
  });

  const render = (onActivate?: () => void) =>
    renderHook(
      ({ unreadTotal, unreadMentions }) =>
        useBrowserNotifications({ unreadTotal, unreadMentions, onActivate }),
      { initialProps: { unreadTotal: 0, unreadMentions: 0 } }
    );

  it('says nothing on the first reading', () => {
    render();
    // Opening the app with three waiting is not three things happening now.
    const { rerender } = renderHook(
      ({ unreadTotal }) =>
        useBrowserNotifications({ unreadTotal, unreadMentions: 0 }),
      { initialProps: { unreadTotal: 3 } }
    );
    rerender({ unreadTotal: 3 });

    expect(shown).toHaveLength(0);
  });

  it('notifies when the total rises and the tab is hidden', () => {
    const { rerender } = render();

    rerender({ unreadTotal: 2, unreadMentions: 0 });

    expect(shown).toHaveLength(1);
    expect(shown[0].options?.body).toBe('2 new messages');
    // One notification that updates, rather than a stack.
    expect(shown[0].options?.tag).toBe('gt-messaging');
  });

  it('names being tagged, because that is the part somebody must act on', () => {
    const { rerender } = render();

    rerender({ unreadTotal: 1, unreadMentions: 1 });

    expect(shown[0].options?.body).toBe('You were tagged in 1 message');
  });

  it('never repeats the message itself', () => {
    const { rerender } = render();

    rerender({ unreadTotal: 1, unreadMentions: 1 });

    // A private message is private from whoever is walking past the screen too.
    const text = `${shown[0].title} ${shown[0].options?.body}`;
    expect(text).not.toMatch(/RO-|@/);
  });

  it('stays quiet while the page is in front of them', () => {
    hidden = false;
    const { rerender } = render();

    rerender({ unreadTotal: 4, unreadMentions: 1 });

    // The badge moved and the ping sounded; a toast on top is noise.
    expect(shown).toHaveLength(0);
  });

  it('stays quiet when the count drops or holds', () => {
    const { rerender } = render();

    rerender({ unreadTotal: 0, unreadMentions: 0 });
    rerender({ unreadTotal: 0, unreadMentions: 0 });

    expect(shown).toHaveLength(0);
  });

  it('stays quiet without permission', () => {
    FakeNotification.permission = 'denied';
    const { rerender } = render();

    rerender({ unreadTotal: 5, unreadMentions: 2 });

    expect(shown).toHaveLength(0);
  });

  it('stays quiet once switched off, permission or not', () => {
    const { result, rerender } = render();

    act(() => result.current.setEnabled(false));
    rerender({ unreadTotal: 5, unreadMentions: 2 });

    expect(shown).toHaveLength(0);
    expect(localStorage.getItem('gt.messaging.desktopNotifications')).toBe(
      'false'
    );
  });

  it('reports itself unsupported rather than throwing', () => {
    delete (window as unknown as { Notification?: unknown }).Notification;

    const { result } = render();

    expect(result.current.permission).toBe('unsupported');
    expect(result.current.active).toBe(false);
  });
});
