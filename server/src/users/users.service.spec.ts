import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';

/**
 * Unit tests for UsersService.
 * The service is instantiated directly with mocked collaborators (no Nest DI).
 *
 * The Clerk-integrated branch of createAdminOrStaff is exercised only with
 * CLERK_SECRET_KEY unset (so the external SDK is never invoked); the live Clerk
 * call path is intentionally not tested as it requires the external SDK.
 */
describe('UsersService', () => {
  let service: UsersService;
  let userRepository: any;
  let roleRepository: any;
  let auditRepository: any;
  let configService: any;

  beforeEach(() => {
    userRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      assignRole: jest.fn(),
    };
    roleRepository = {
      findById: jest.fn(),
      findByName: jest.fn(),
    };
    auditRepository = { create: jest.fn().mockResolvedValue({}) };
    configService = { get: jest.fn().mockReturnValue(undefined) };

    service = new UsersService(
      userRepository as any,
      roleRepository as any,
      auditRepository as any,
      configService as any
    );
  });

  describe('findAll', () => {
    it('delegates to the repository with filters', async () => {
      userRepository.findAll.mockResolvedValue([{ id: 'u1' }]);

      const result = await service.findAll({ isActive: true });

      expect(userRepository.findAll).toHaveBeenCalledWith({ isActive: true });
      expect(result).toEqual([{ id: 'u1' }]);
    });
  });

  describe('findById', () => {
    it('throws NotFoundException when the user does not exist', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(service.findById('missing')).rejects.toBeInstanceOf(
        NotFoundException
      );
    });

    it('returns the user when found', async () => {
      userRepository.findById.mockResolvedValue({ id: 'u1' });

      const result = await service.findById('u1');

      expect(result).toEqual({ id: 'u1' });
    });
  });

  describe('findByEmail', () => {
    it('delegates to the repository', async () => {
      userRepository.findByEmail.mockResolvedValue({ id: 'u1' });

      const result = await service.findByEmail('a@b.com');

      expect(userRepository.findByEmail).toHaveBeenCalledWith('a@b.com');
      expect(result).toEqual({ id: 'u1' });
    });
  });

  describe('create', () => {
    const data = {
      email: 'a@b.com',
      firstName: 'A',
      lastName: 'B',
      roleId: 'role-1',
      createdBy: 'admin-1',
    };

    it('throws ConflictException when the email already exists', async () => {
      userRepository.findByEmail.mockResolvedValue({ id: 'existing' });

      await expect(service.create(data)).rejects.toBeInstanceOf(
        ConflictException
      );
    });

    it('throws NotFoundException when the role does not exist', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      roleRepository.findById.mockResolvedValue(null);

      await expect(service.create(data)).rejects.toBeInstanceOf(
        NotFoundException
      );
    });

    it('creates the user and logs the action', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      roleRepository.findById.mockResolvedValue({ id: 'role-1' });
      userRepository.create.mockResolvedValue({ id: 'u1' });

      const result = await service.create(data);

      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'a@b.com', roleId: 'role-1' })
      );
      expect(auditRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'USER_CREATED', entityId: 'u1' })
      );
      expect(result).toEqual({ id: 'u1' });
    });
  });

  describe('createAdminOrStaff', () => {
    const data = {
      email: 'a@b.com',
      username: 'auser',
      firstName: 'A',
      lastName: 'B',
      roleName: 'STAFF' as const,
      createdBy: 'admin-1',
      password: 'pw',
    };

    it('throws ConflictException when the email already exists', async () => {
      userRepository.findByEmail.mockResolvedValue({ id: 'existing' });

      await expect(service.createAdminOrStaff(data)).rejects.toBeInstanceOf(
        ConflictException
      );
    });

    it('throws NotFoundException when the role does not exist', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      roleRepository.findByName.mockResolvedValue(null);

      await expect(service.createAdminOrStaff(data)).rejects.toBeInstanceOf(
        NotFoundException
      );
    });

    it('creates the user without Clerk when CLERK_SECRET_KEY is not configured', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      roleRepository.findByName.mockResolvedValue({ id: 'role-1' });
      userRepository.create.mockResolvedValue({ id: 'u1', email: 'a@b.com' });

      const result = await service.createAdminOrStaff(data);

      // CLERK_SECRET_KEY is undefined -> empty clerkId, clerkCreated false
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ clerkId: '', roleId: 'role-1' })
      );
      expect(auditRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'ADMIN_STAFF_USER_CREATED' })
      );
      expect(result).toEqual(
        expect.objectContaining({ id: 'u1', clerkCreated: false })
      );
    });
  });

  describe('update', () => {
    it('throws NotFoundException when the user does not exist', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(
        service.update('missing', { updatedBy: 'admin-1' })
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws ConflictException when changing to an email already in use', async () => {
      userRepository.findById.mockResolvedValue({
        id: 'u1',
        email: 'old@b.com',
      });
      userRepository.findByEmail.mockResolvedValue({ id: 'other' });

      await expect(
        service.update('u1', { email: 'new@b.com', updatedBy: 'admin-1' })
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('updates the user and logs the action', async () => {
      userRepository.findById.mockResolvedValue({
        id: 'u1',
        email: 'old@b.com',
      });
      userRepository.update.mockResolvedValue({ id: 'u1', firstName: 'New' });

      const result = await service.update('u1', {
        firstName: 'New',
        updatedBy: 'admin-1',
      });

      expect(userRepository.update).toHaveBeenCalledWith(
        'u1',
        expect.objectContaining({ firstName: 'New' })
      );
      expect(auditRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'USER_UPDATED', entityId: 'u1' })
      );
      expect(result).toEqual({ id: 'u1', firstName: 'New' });
    });

    it('does not check email conflict when email is unchanged', async () => {
      userRepository.findById.mockResolvedValue({
        id: 'u1',
        email: 'same@b.com',
      });
      userRepository.update.mockResolvedValue({ id: 'u1' });

      await service.update('u1', { email: 'same@b.com', updatedBy: 'admin-1' });

      expect(userRepository.findByEmail).not.toHaveBeenCalled();
    });
  });

  describe('assignRole', () => {
    it('throws NotFoundException when the role does not exist', async () => {
      userRepository.findById.mockResolvedValue({
        id: 'u1',
        role: { name: 'STAFF' },
      });
      roleRepository.findById.mockResolvedValue(null);

      await expect(
        service.assignRole('u1', 'role-x', 'admin-1')
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws ForbiddenException when a non-admin modifies an admin user', async () => {
      userRepository.findById
        .mockResolvedValueOnce({ id: 'u1', role: { name: 'ADMIN' } }) // target user
        .mockResolvedValueOnce({ id: 'assigner', role: { name: 'STAFF' } }); // assigner
      roleRepository.findById.mockResolvedValue({
        id: 'role-1',
        name: 'STAFF',
      });

      await expect(
        service.assignRole('u1', 'role-1', 'assigner')
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('assigns the role and logs the action', async () => {
      userRepository.findById.mockResolvedValue({
        id: 'u1',
        role: { name: 'STAFF' },
      });
      roleRepository.findById.mockResolvedValue({
        id: 'role-2',
        name: 'SUPERVISOR',
      });
      userRepository.assignRole.mockResolvedValue({
        id: 'u1',
        roleId: 'role-2',
      });

      const result = await service.assignRole('u1', 'role-2', 'admin-1');

      expect(userRepository.assignRole).toHaveBeenCalledWith('u1', 'role-2');
      expect(auditRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'ROLE_ASSIGNED',
          details: { oldRole: 'STAFF', newRole: 'SUPERVISOR' },
        })
      );
      expect(result).toEqual({ id: 'u1', roleId: 'role-2' });
    });

    it('allows an admin to modify an admin user', async () => {
      userRepository.findById
        .mockResolvedValueOnce({ id: 'u1', role: { name: 'ADMIN' } })
        .mockResolvedValueOnce({ id: 'assigner', role: { name: 'ADMIN' } });
      roleRepository.findById.mockResolvedValue({
        id: 'role-1',
        name: 'STAFF',
      });
      userRepository.assignRole.mockResolvedValue({ id: 'u1' });

      const result = await service.assignRole('u1', 'role-1', 'assigner');

      expect(result).toEqual({ id: 'u1' });
    });
  });

  describe('assignRoleByName', () => {
    it('throws NotFoundException when the role name does not exist', async () => {
      userRepository.findById.mockResolvedValue({
        id: 'u1',
        role: { name: 'STAFF' },
      });
      roleRepository.findByName.mockResolvedValue(null);

      await expect(
        service.assignRoleByName('u1', 'STAFF', 'admin-1')
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws ForbiddenException when a non-admin modifies an admin user', async () => {
      userRepository.findById
        .mockResolvedValueOnce({ id: 'u1', role: { name: 'ADMIN' } })
        .mockResolvedValueOnce({ id: 'assigner', role: { name: 'STAFF' } });
      roleRepository.findByName.mockResolvedValue({
        id: 'role-1',
        name: 'STAFF',
      });

      await expect(
        service.assignRoleByName('u1', 'STAFF', 'assigner')
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('assigns the role by name and logs the action', async () => {
      userRepository.findById.mockResolvedValue({
        id: 'u1',
        role: { name: 'STAFF' },
      });
      roleRepository.findByName.mockResolvedValue({
        id: 'role-2',
        name: 'SUPERVISOR',
      });
      userRepository.assignRole.mockResolvedValue({ id: 'u1' });

      const result = await service.assignRoleByName(
        'u1',
        'SUPERVISOR',
        'admin-1'
      );

      expect(userRepository.assignRole).toHaveBeenCalledWith('u1', 'role-2');
      expect(auditRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'ROLE_ASSIGNED',
          details: { oldRole: 'STAFF', newRole: 'SUPERVISOR' },
        })
      );
      expect(result).toEqual({ id: 'u1' });
    });
  });

  describe('delete', () => {
    it('throws ForbiddenException when a non-admin deletes an admin user', async () => {
      userRepository.findById
        .mockResolvedValueOnce({
          id: 'u1',
          role: { name: 'ADMIN' },
          email: 'a@b.com',
        })
        .mockResolvedValueOnce({ id: 'deleter', role: { name: 'STAFF' } });

      await expect(service.delete('u1', 'deleter')).rejects.toBeInstanceOf(
        ForbiddenException
      );
    });

    it('soft-deletes by deactivating and logs the action', async () => {
      userRepository.findById.mockResolvedValue({
        id: 'u1',
        role: { name: 'STAFF' },
        email: 'a@b.com',
      });
      userRepository.update.mockResolvedValue({ id: 'u1', isActive: false });

      const result = await service.delete('u1', 'admin-1');

      expect(userRepository.update).toHaveBeenCalledWith('u1', {
        isActive: false,
      });
      expect(auditRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'USER_DEACTIVATED' })
      );
      expect(result).toEqual({ id: 'u1', isActive: false });
    });
  });

  describe('changePassword / resetPassword', () => {
    it('changePassword always throws ForbiddenException (managed by Clerk)', async () => {
      await expect(
        service.changePassword('u1', 'old', 'new')
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('resetPassword always throws ForbiddenException (managed by Clerk)', async () => {
      await expect(
        service.resetPassword('u1', 'new', 'admin-1')
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });
});
