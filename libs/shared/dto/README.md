# @gt-automotive/shared-dto

This library contains all Data Transfer Objects (DTOs) shared between the frontend and backend applications.

## Overview

DTOs define the structure of data that flows between the client and server, ensuring type safety and consistency across the application.

## Structure

```
src/
├── index.ts              # Main export file
└── lib/
    ├── auth/            # Authentication DTOs
    │   ├── index.ts
    │   ├── register.dto.ts
    │   └── user.dto.ts
    └── tire/            # Tire inventory DTOs
        └── [tire DTOs]
```

## Available DTOs

### Authentication DTOs

- **RegisterDto**: Customer registration data structure
- **LoginDto**: Login credentials structure
- **UserDto**: User data transfer object
- **CreateUserDto**: Admin user creation
- **UpdateUserDto**: User profile updates

### Tire DTOs (Coming Soon)

- **TireDto**: Tire inventory item
- **CreateTireDto**: New tire entry
- **UpdateTireDto**: Tire updates
- **TireSearchDto**: Search parameters

## Usage

### Import in NestJS (Backend)

```typescript
import { RegisterDto, LoginDto } from '@gt-automotive/shared-dto';

@Post('register')
async register(@Body() dto: RegisterDto) {
  // Implementation
}
```

### Import in React (Frontend)

```typescript
import { UserDto } from '@gt-automotive/shared-dto';

interface Props {
  user: UserDto;
}
```

## Building

Run `nx build shared-dto` to build the library.

## Testing

Run `nx test shared-dto` to execute unit tests.

## Contributing

When adding new DTOs:
1. Create the DTO file in the appropriate subdirectory
2. Add validation decorators if using with NestJS
3. Export from the subdirectory's index.ts
4. Export from the main index.ts
5. Document the DTO purpose and fields

## Dependencies

- class-validator: For validation decorators
- class-transformer: For data transformation