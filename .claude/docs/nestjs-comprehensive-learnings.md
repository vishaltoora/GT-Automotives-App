# NestJS Comprehensive Learning Guide

## Overview

NestJS is a progressive Node.js framework for building efficient, reliable, and scalable server-side applications. It uses modern JavaScript and is built with TypeScript, combining elements of OOP (Object Oriented Programming), FP (Functional Programming), and FRP (Functional Reactive Programming).

## Core Architecture Concepts

### 1. Dependency Injection (DI)

NestJS has a built-in IoC (Inversion of Control) container that resolves dependencies between providers.

```typescript
// Service with dependency injection
@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly logger: Logger
  ) {}
}

// Controller with service injection
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
}
```

**Key Benefits**:
- Loose coupling between components
- Easy testing with mock dependencies
- Centralized dependency management
- Automatic lifecycle management

### 2. Modules

Modules are the basic building blocks of a NestJS application. They organize related code into cohesive units.

```typescript
@Module({
  imports: [DatabaseModule, AuthModule],    // Other modules this module depends on
  controllers: [UsersController],           // Controllers defined in this module
  providers: [UsersService, UserRepository], // Services available in this module
  exports: [UsersService],                  // Services available to importing modules
})
export class UsersModule {}
```

**Module Types**:
- **Feature Modules**: Organize features (UsersModule, ProductsModule)
- **Shared Modules**: Common functionality across features
- **Global Modules**: Available throughout the application
- **Dynamic Modules**: Configurable modules with runtime parameters

### 3. Controllers

Controllers handle incoming requests and return responses to the client.

```typescript
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(id);
  }
}
```

**Controller Features**:
- Route handling with HTTP method decorators
- Parameter extraction (@Param, @Query, @Body)
- Response status codes and headers
- Exception handling
- Validation pipes integration

### 4. Providers and Services

Providers are classes that can be injected as dependencies. Services are the most common type of provider.

```typescript
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    await this.userRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
}
```

## Advanced Concepts

### 1. Middleware

Middleware functions execute before the route handler and can modify request/response objects.

```typescript
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(`${req.method} ${req.url} - ${Date.now()}`);
    next();
  }
}

// Apply middleware
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: 'users', method: RequestMethod.GET });
  }
}
```

### 2. Guards

Guards determine whether a request should be handled by the route handler.

```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Token not found');
    }

    try {
      const payload = this.jwtService.verify(token);
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}

// Apply guard
@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  // Protected routes
}
```

### 3. Interceptors

Interceptors can transform the result returned from a function or extend basic function behavior.

```typescript
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map(data => ({
        success: true,
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}

// Apply interceptor
@Controller('users')
@UseInterceptors(TransformInterceptor)
export class UsersController {
  // Responses will be transformed
}
```

### 4. Pipes

Pipes transform input data and perform validation.

```typescript
@Injectable()
export class ValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // Perform validation
    if (!this.isValid(value)) {
      throw new BadRequestException('Validation failed');
    }
    return this.transformValue(value);
  }

  private isValid(value: any): boolean {
    // Validation logic
    return true;
  }

  private transformValue(value: any): any {
    // Transform logic
    return value;
  }
}

// Apply pipe
@Post()
async create(@Body(ValidationPipe) createUserDto: CreateUserDto) {
  return this.usersService.create(createUserDto);
}
```

## Database Integration

### 1. TypeORM Integration

```typescript
// Entity definition
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// Repository pattern
@Injectable()
export class UserRepository extends Repository<User> {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }
}
```

### 2. Prisma Integration

```typescript
// Prisma service
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

// Service using Prisma
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany();
  }

  async create(data: CreateUserDto) {
    return this.prisma.user.create({ data });
  }
}
```

## Authentication and Security

### 1. JWT Authentication Strategy

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email };
  }
}

// Auth module
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

### 2. Role-Based Access Control (RBAC)

```typescript
// Roles decorator
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

// Roles guard
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}

// Usage
@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
export class AdminController {
  @Get('users')
  @Roles('admin')
  async getUsers() {
    return this.usersService.findAll();
  }
}
```

## Exception Handling

### 1. Global Exception Filter

```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? exception.message
      : 'Internal server error';

    this.logger.error(`${request.method} ${request.url}`, exception);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}

// Apply globally
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen(3000);
}
```

### 2. Custom Exceptions

```typescript
export class UserNotFoundException extends HttpException {
  constructor(userId: string) {
    super(`User with ID ${userId} not found`, HttpStatus.NOT_FOUND);
  }
}

export class DuplicateEmailException extends HttpException {
  constructor(email: string) {
    super(`User with email ${email} already exists`, HttpStatus.CONFLICT);
  }
}
```

## Validation and DTOs

### 1. Class Validator Integration

```typescript
export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  lastName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}

// Global validation pipe
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  await app.listen(3000);
}
```

## Testing

### 1. Unit Testing

```typescript
describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should find all users', async () => {
    const users = [{ id: '1', email: 'test@test.com' }];
    jest.spyOn(repository, 'find').mockResolvedValue(users as User[]);

    const result = await service.findAll();
    expect(result).toEqual(users);
  });
});
```

### 2. Integration Testing

```typescript
describe('UsersController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/users (GET)', () => {
    return request(app.getHttpServer())
      .get('/users')
      .expect(200)
      .expect('Content-Type', /json/);
  });

  afterAll(async () => {
    await app.close();
  });
});
```

## Configuration Management

### 1. Environment Configuration

```typescript
// Configuration schema
export const configSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
});

// Configuration module
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),
  ],
})
export class AppModule {}

// Using configuration
@Injectable()
export class DatabaseService {
  constructor(private readonly configService: ConfigService) {}

  getDatabaseUrl(): string {
    return this.configService.get<string>('DATABASE_URL');
  }
}
```

## Performance Optimization

### 1. Caching

```typescript
@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: Repository<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findOne(id: string): Promise<User> {
    const cacheKey = `user_${id}`;
    const cachedUser = await this.cacheManager.get<User>(cacheKey);

    if (cachedUser) {
      return cachedUser;
    }

    const user = await this.userRepository.findOne({ where: { id } });
    if (user) {
      await this.cacheManager.set(cacheKey, user, { ttl: 300 });
    }

    return user;
  }
}
```

### 2. Request Lifecycle Optimization

```typescript
// Async context tracking
@Injectable()
export class RequestContextService {
  private readonly asyncLocalStorage = new AsyncLocalStorage<Map<string, any>>();

  run<T>(callback: () => T): T {
    const context = new Map();
    return this.asyncLocalStorage.run(context, callback);
  }

  set(key: string, value: any): void {
    const context = this.asyncLocalStorage.getStore();
    context?.set(key, value);
  }

  get(key: string): any {
    const context = this.asyncLocalStorage.getStore();
    return context?.get(key);
  }
}
```

## Best Practices

### 1. Project Structure

```
src/
├── app.module.ts
├── main.ts
├── common/                 # Shared utilities
│   ├── decorators/
│   ├── guards/
│   ├── interceptors/
│   └── pipes/
├── config/                 # Configuration files
├── database/               # Database related files
├── modules/                # Feature modules
│   ├── users/
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.module.ts
│   │   ├── dto/
│   │   └── entities/
│   └── auth/
└── shared/                 # Shared modules
```

### 2. Error Handling Patterns

```typescript
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  async findOne(id: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return user;
    } catch (error) {
      this.logger.error(`Failed to find user ${id}`, error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve user');
    }
  }
}
```

### 3. Logging Best Practices

```typescript
@Injectable()
export class LoggingService extends Logger {
  log(message: string, context?: string) {
    super.log(message, context);
  }

  error(message: string, trace?: string, context?: string) {
    super.error(message, trace, context);
  }

  warn(message: string, context?: string) {
    super.warn(message, context);
  }

  debug(message: string, context?: string) {
    super.debug(message, context);
  }

  verbose(message: string, context?: string) {
    super.verbose(message, context);
  }
}
```

## Deployment Considerations

### 1. Health Checks

```typescript
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
    ]);
  }
}
```

### 2. Graceful Shutdown

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable shutdown hooks
  app.enableShutdownHooks();

  const port = process.env.PORT || 3000;
  await app.listen(port);

  process.on('SIGTERM', async () => {
    await app.close();
    process.exit(0);
  });
}
```

## Common Patterns in GT Automotive Application

### 1. Repository Pattern Implementation

```typescript
// Base repository
export abstract class BaseRepository<T> {
  constructor(
    protected readonly repository: Repository<T>,
    protected readonly logger: Logger,
  ) {}

  async findAll(): Promise<T[]> {
    return this.repository.find();
  }

  async findOne(id: string): Promise<T> {
    const entity = await this.repository.findOne({ where: { id } as any });
    if (!entity) {
      throw new NotFoundException(`Entity with ID ${id} not found`);
    }
    return entity;
  }

  async create(createDto: any): Promise<T> {
    const entity = this.repository.create(createDto);
    return this.repository.save(entity);
  }

  async update(id: string, updateDto: any): Promise<T> {
    await this.repository.update(id, updateDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Entity with ID ${id} not found`);
    }
  }
}
```

### 2. Clerk Authentication Integration

```typescript
@Injectable()
export class ClerkJwtStrategy extends PassportStrategy(Strategy, 'clerk-jwt') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: (request, rawJwtToken, done) => {
        this.getPublicKey()
          .then(key => done(null, key))
          .catch(err => done(err));
      },
      algorithms: ['RS256'],
    });
  }

  private async getPublicKey(): Promise<string> {
    const jwksUrl = this.configService.get('CLERK_JWKS_URL');
    // Fetch and return public key from Clerk
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      email: payload.email,
      roles: payload.roles || [],
    };
  }
}
```

---

**Last Updated**: September 24, 2025
**Status**: Comprehensive NestJS documentation covering core concepts and GT Automotive patterns
**Coverage**: Architecture, DI, modules, controllers, services, auth, testing, deployment
**Source**: NestJS official concepts + GT Automotive application patterns

This comprehensive guide should serve as a reference for NestJS development patterns used in the GT Automotive application and general NestJS best practices.