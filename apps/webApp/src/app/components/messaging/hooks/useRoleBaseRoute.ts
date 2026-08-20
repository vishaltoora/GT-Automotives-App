import { useLocation } from 'react-router-dom';

/**
 * The route prefix for whichever role's section the user is currently in.
 *
 * The same repair order lives at /admin/repair-orders/:id, /staff/... ,
 * /supervisor/... and /foreman/..., each behind its own role guard. Linking to
 * a fixed prefix sends everyone but an admin to a page they are not allowed to
 * open, so a link built for one role cannot be reused for another.
 *
 * Mirrors how RODetail already derives its own links.
 */
export function useRoleBaseRoute(): string {
  const { pathname } = useLocation();

  if (pathname.startsWith('/staff')) return '/staff';
  if (pathname.startsWith('/supervisor')) return '/supervisor';
  if (pathname.startsWith('/foreman')) return '/foreman';
  if (pathname.startsWith('/accountant')) return '/accountant';
  return '/admin';
}
