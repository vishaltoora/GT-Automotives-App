import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleGuard } from './role.guard';

describe('RoleGuard', () => {
  let reflector: Reflector;
  let guard: RoleGuard;

  const contextFor = (user: unknown): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ method: 'GET', url: '/api/invoices', user }),
      }),
      getHandler: () => undefined,
      getClass: () => undefined,
    } as unknown as ExecutionContext);

  const requireRoles = (roles: string[] | undefined) => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(roles);
  };

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RoleGuard(reflector);
  });

  it('allows any request when the route declares no roles', () => {
    requireRoles(undefined);

    expect(guard.canActivate(contextFor(undefined))).toBe(true);
  });

  it('allows a user whose role is in the required list', () => {
    requireRoles(['ADMIN', 'STAFF']);

    expect(
      guard.canActivate(contextFor({ id: 'u1', role: { name: 'STAFF' } }))
    ).toBe(true);
  });

  it('denies a user whose role is not in the required list', () => {
    requireRoles(['ADMIN']);

    expect(
      guard.canActivate(contextFor({ id: 'u1', role: { name: 'CUSTOMER' } }))
    ).toBe(false);
  });

  it('denies an unauthenticated request', () => {
    requireRoles(['ADMIN']);

    expect(guard.canActivate(contextFor(undefined))).toBe(false);
  });

  it('denies a user carrying no role', () => {
    requireRoles(['ADMIN']);

    expect(guard.canActivate(contextFor({ id: 'u1' }))).toBe(false);
  });

  describe('logging', () => {
    afterEach(() => {
      delete process.env.AUTH_DEBUG;
    });

    it('stays silent on an allowed request by default', () => {
      requireRoles(['STAFF']);
      const debug = jest
        .spyOn(guard['logger'], 'debug')
        .mockImplementation(() => undefined);
      const warn = jest
        .spyOn(guard['logger'], 'warn')
        .mockImplementation(() => undefined);

      guard.canActivate(contextFor({ id: 'u1', role: { name: 'STAFF' } }));

      expect(debug).not.toHaveBeenCalled();
      expect(warn).not.toHaveBeenCalled();
    });

    it('logs allowed requests when AUTH_DEBUG is on', () => {
      process.env.AUTH_DEBUG = 'true';
      requireRoles(['STAFF']);
      const debug = jest
        .spyOn(guard['logger'], 'debug')
        .mockImplementation(() => undefined);

      guard.canActivate(contextFor({ id: 'u1', role: { name: 'STAFF' } }));

      expect(debug).toHaveBeenCalledTimes(1);
    });

    it('warns on a denial even when debug is off', () => {
      requireRoles(['ADMIN']);
      const warn = jest
        .spyOn(guard['logger'], 'warn')
        .mockImplementation(() => undefined);

      guard.canActivate(contextFor({ id: 'u1', role: { name: 'CUSTOMER' } }));

      expect(warn).toHaveBeenCalledTimes(1);
    });
  });
});
