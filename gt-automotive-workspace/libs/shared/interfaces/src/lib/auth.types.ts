import { User, Permission } from './user.interface';
import { RoleName } from './roles.enum';

export interface AuthUser {
  id: string;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: RoleName;
  permissions: Array<{
    resource: string;
    action: string;
  }>;
}

export interface UserContext {
  user: AuthUser | null;
  loading: boolean;
  error?: string;
  hasPermission: (resource: string, action: string) => boolean;
  hasRole: (role: RoleName) => boolean;
  canAccess: (requiredRoles: RoleName[]) => boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken?: string;
  refreshToken?: string;
}

export interface ClerkUser {
  id: string;
  emailAddresses: Array<{
    emailAddress: string;
    id: string;
  }>;
  firstName?: string;
  lastName?: string;
  publicMetadata?: Record<string, any>;
  privateMetadata?: Record<string, any>;
  unsafeMetadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}