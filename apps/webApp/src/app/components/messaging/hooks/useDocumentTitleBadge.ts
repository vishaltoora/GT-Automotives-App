import { useEffect, useRef } from 'react';

const EXISTING_BADGE = /^\(\d+\)\s*/;

/**
 * Puts the unread count in the browser tab title: "(3) GT Automotives".
 *
 * The one notification surface that survives the tab being in the background
 * without asking anyone's permission. A row of tabs is scanned dozens of times
 * an hour, and a number appearing in one of them is noticed by people who
 * would never have thought to open the app.
 *
 * The base title is captured once, so repeated updates cannot stack badges on
 * top of each other, and it is put back on unmount.
 */
export function useDocumentTitleBadge(count: number) {
  const baseTitle = useRef('');

  useEffect(() => {
    baseTitle.current = document.title.replace(EXISTING_BADGE, '');
    return () => {
      document.title = baseTitle.current;
    };
  }, []);

  useEffect(() => {
    const base =
      baseTitle.current || document.title.replace(EXISTING_BADGE, '');
    document.title = count > 0 ? `(${count}) ${base}` : base;
  }, [count]);
}
