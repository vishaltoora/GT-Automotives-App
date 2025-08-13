export class LoginDto {
  email!: string;
  password!: string;
}

export class LoginResponseDto {
  accessToken!: string;
  refreshToken?: string;
  user!: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
    permissions: Array<{
      resource: string;
      action: string;
    }>;
  };
}