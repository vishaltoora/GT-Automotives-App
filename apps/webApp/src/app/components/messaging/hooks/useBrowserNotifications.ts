import { useCallback, useEffect, useRef, useState } from 'react';

const PREFERENCE_KEY = 'gt.messaging.desktopNotifications';

/** What the browser will let us do, plus the case where it has no idea. */
export type NotificationPermissionState =
  | 'unsupported'
  | 'default'
  | 'granted'
  | 'denied';

interface Options {
  /** Mentions plus unread messages — the same total the ping listens to. */
  unreadTotal: number;
  /** How much of that total is somebody tagging you. */
  unreadMentions: number;
  /** Clicking the notification should land them in the conversation. */
  onActivate?: () => void;
}

function readPreference(): boolean {
  try {
    return localStorage.getItem(PREFERENCE_KEY) !== 'false';
  } catch {
    // Private browsing throws on access. Permission is still the real gate.
    return true;
  }
}

function currentPermission(): NotificationPermissionState {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission as NotificationPermissionState;
}

/**
 * Tells somebody a message arrived when they are not looking at the page.
 *
 * The badge and the ping only reach a person with the app in front of them,
 * which is the easy half of the problem — the tagged work that goes unseen is
 * the work tagged while they were in another tab. A notification is the
 * cheapest thing that crosses that line: no service worker, no vendor, no
 * monthly cost, and it works in every browser the shop uses.
 *
 * Two deliberate limits:
 *
 * - **Nothing is said about the message.** No author, no body, no repair order.
 *   A private message exists so that only the people in it can read it, and a
 *   toast on a shop counter screen is read by whoever walks past. The
 *   notification says how much arrived and leaves the rest behind the login.
 * - **Only while the tab is hidden.** With the page in front of them the badge
 *   moved and the ping already sounded; a toast on top of that is noise.
 */
export function useBrowserNotifications({
  unreadTotal,
  unreadMentions,
  onActivate,
}: Options) {
  const [permission, setPermission] =
    useState<NotificationPermissionState>(currentPermission);
  const [enabled, setEnabledState] = useState(readPreference);

  const previousTotal = useRef<number | null>(null);
  const previousMentions = useRef(0);

  const onActivateRef = useRef(onActivate);
  onActivateRef.current = onActivate;

  const setEnabled = useCallback((next: boolean) => {
    setEnabledState(next);
    try {
      localStorage.setItem(PREFERENCE_KEY, String(next));
    } catch {
      // Preference is lost on reload; the toggle still works for this session.
    }
  }, []);

  /**
   * Asking has to come from a click.
   *
   * Browsers refuse a permission prompt that no gesture asked for, and the
   * ones that do not refuse it punish the site for prompting on load. So this
   * is wired to the bell in the panel header rather than to mount.
   */
  const request = useCallback(async () => {
    if (currentPermission() === 'unsupported') return;

    try {
      const result = await Notification.requestPermission();
      setPermission(result as NotificationPermissionState);
      if (result === 'granted') setEnabled(true);
    } catch {
      // Older Safari hands back a callback API rather than a promise. Nothing
      // to do but leave the state as it was.
      setPermission(currentPermission());
    }
  }, [setEnabled]);

  useEffect(() => {
    const priorTotal = previousTotal.current;
    const priorMentions = previousMentions.current;
    previousTotal.current = unreadTotal;
    previousMentions.current = unreadMentions;

    // Never on the first reading, or opening the app would announce everything
    // that arrived while it was shut.
    if (priorTotal === null || unreadTotal <= priorTotal) return;
    if (!enabled || permission !== 'granted') return;
    if (!document.hidden) return;

    const taggedArrived = unreadMentions - priorMentions;
    const arrived = unreadTotal - priorTotal;

    const body =
      taggedArrived > 0
        ? `You were tagged in ${taggedArrived} ${
            taggedArrived === 1 ? 'message' : 'messages'
          }`
        : `${arrived} new ${arrived === 1 ? 'message' : 'messages'}`;

    try {
      const notification = new Notification('GT Automotives', {
        body,
        icon: '/logo.png',
        // One notification that updates, rather than a stack of them building
        // up behind somebody who stepped away for an hour.
        tag: 'gt-messaging',
        silent: false,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
        onActivateRef.current?.();
      };
    } catch {
      // iOS Safari throws on the constructor unless the page is an installed
      // PWA with a service worker. The badge and the ping still did their job.
    }
  }, [unreadTotal, unreadMentions, enabled, permission]);

  return {
    permission,
    /** Granted *and* not switched off in the panel. */
    active: permission === 'granted' && enabled,
    enabled,
    setEnabled,
    request,
  };
}
