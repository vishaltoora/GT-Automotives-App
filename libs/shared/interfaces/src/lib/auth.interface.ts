export interface IUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: IRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRole {
  id: number;
  name: string;
  description?: string;
  permissions?: IPermission[];
}

export interface IPermission {
  id: number;
  name: string;
  description?: string;
  resource: string;
  action: string;
}

export interface IAuthContext {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: string | null;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface ILoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export interface IRegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface IRegisterResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export interface ITokenPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}