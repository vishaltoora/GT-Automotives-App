// Re-export user DTOs from auth module for backward compatibility
export { 
  AuthCreateUserDto as CreateUserDto,
  AuthUpdateUserDto as UpdateUserDto,
  AuthUserResponseDto as UserResponseDto
} from '../auth/auth-user.dto';