import { useCallback, useLayoutEffect, useRef, useState } from 'react';

interface Options {
  /** Never shrink below this, however little room is left. */
  min?: number;
  /** Breathing room between the bottom of the panel and the bottom of the screen. */
  gap?: number;
  /** Skip the work entirely when the panel is sized by its parent instead. */
  enabled?: boolean;
}

/**
 * Sizes an element to run from wherever it sits down to the bottom of the
 * screen.
 *
 * A chat panel with a height picked in advance is wrong on every device but
 * the one it was picked on. At 480px under a tall repair-order header it put
 * the composer below the fold on a phone: the thread looked like a read-only
 * list of messages with no way to write one, and you had to know to scroll to
 * find out otherwise. Measuring means the input is on screen to begin with,
 * whatever is above it.
 *
 * Measured on mount and on resize, but deliberately **not** on scroll — the
 * element's distance from the top of the viewport changes as the page moves,
 * and following that would resize the panel continuously while you read.
 *
 * `visualViewport` rather than `innerHeight` is what handles a phone keyboard:
 * opening one shrinks the visual viewport, so the panel shortens and the
 * composer stays above the keys instead of behind them.
 */
export function useViewportFill<T extends HTMLElement>({
  min = 320,
  gap = 12,
  enabled = true,
}: Options = {}) {
  const ref = useRef<T | null>(null);
  const [height, setHeight] = useState<number | undefined>(undefined);

  const measure = useCallback(() => {
    const node = ref.current;
    if (!node || !enabled) return;

    const viewport = window.visualViewport?.height ?? window.innerHeight;
    // Clamped at zero: once the panel's top has scrolled off, the space left
    // is the whole screen, not more than it.
    const top = Math.max(0, node.getBoundingClientRect().top);

    setHeight(Math.max(min, Math.round(viewport - top - gap)));
  }, [enabled, gap, min]);

  useLayoutEffect(() => {
    if (!enabled) {
      setHeight(undefined);
      return;
    }

    measure();

    // One more pass after layout settles: fonts and images above the panel can
    // land after the first measurement, and a tab that scrolls itself into
    // view does so after its children have already measured once.
    const settle = window.setTimeout(measure, 200);

    /*
     * Re-measure when the page stops moving, never while it moves.
     *
     * Following every scroll event would resize the panel continuously under
     * whoever is reading it; ignoring scrolling altogether leaves the height
     * wrong for good once the page has moved. Waiting for the pause is both.
     */
    let idle = 0;
    const onScroll = () => {
      window.clearTimeout(idle);
      idle = window.setTimeout(measure, 180);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure);
    window.addEventListener('orientationchange', measure);
    window.visualViewport?.addEventListener('resize', measure);

    return () => {
      window.clearTimeout(settle);
      window.clearTimeout(idle);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', measure);
      window.removeEventListener('orientationchange', measure);
      window.visualViewport?.removeEventListener('resize', measure);
    };
  }, [enabled, measure]);

  return { ref, height, remeasure: measure };
}
