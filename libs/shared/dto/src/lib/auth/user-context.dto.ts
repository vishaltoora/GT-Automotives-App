export class AuthUserContextDto {
  id!: string;
  email!: string;
  firstName?: string;
  lastName?: string;
  role!: string;
  permissions!: Array<{
    resource: string;
    action: string;
  }>;
}

export class AssignRoleDto {
  userId!: string;
  role!: 'CUSTOMER' | 'STAFF' | 'ADMIN';
}