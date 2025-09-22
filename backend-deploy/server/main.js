/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("reflect-metadata");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const config_1 = __webpack_require__(6);
const core_1 = __webpack_require__(3);
const app_controller_1 = __webpack_require__(7);
const app_service_1 = __webpack_require__(8);
const auth_module_1 = __webpack_require__(9);
const users_module_1 = __webpack_require__(32);
const tires_module_1 = __webpack_require__(35);
const customers_module_1 = __webpack_require__(42);
const vehicles_module_1 = __webpack_require__(46);
const invoices_module_1 = __webpack_require__(50);
const quotations_module_1 = __webpack_require__(54);
const health_module_1 = __webpack_require__(58);
const jwt_auth_guard_1 = __webpack_require__(23);
const role_guard_1 = __webpack_require__(28);
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env.local', '.env'],
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            tires_module_1.TiresModule,
            customers_module_1.CustomersModule,
            vehicles_module_1.VehiclesModule,
            invoices_module_1.InvoicesModule,
            quotations_module_1.QuotationsModule,
            health_module_1.HealthModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: role_guard_1.RoleGuard,
            },
        ],
    })
], AppModule);


/***/ }),
/* 5 */
/***/ ((module) => {

module.exports = require("tslib");

/***/ }),
/* 6 */
/***/ ((module) => {

module.exports = require("@nestjs/config");

/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppController = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const app_service_1 = __webpack_require__(8);
let AppController = class AppController {
    constructor(appService) {
        this.appService = appService;
    }
    getData() {
        return this.appService.getData();
    }
};
exports.AppController = AppController;
tslib_1.__decorate([
    (0, common_1.Get)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], AppController.prototype, "getData", null);
exports.AppController = AppController = tslib_1.__decorate([
    (0, common_1.Controller)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof app_service_1.AppService !== "undefined" && app_service_1.AppService) === "function" ? _a : Object])
], AppController);


/***/ }),
/* 8 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppService = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
let AppService = class AppService {
    getData() {
        return { message: 'Hello API' };
    }
};
exports.AppService = AppService;
exports.AppService = AppService = tslib_1.__decorate([
    (0, common_1.Injectable)()
], AppService);


/***/ }),
/* 9 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthModule = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const jwt_1 = __webpack_require__(10);
const passport_1 = __webpack_require__(11);
const config_1 = __webpack_require__(6);
const auth_service_1 = __webpack_require__(12);
const auth_controller_1 = __webpack_require__(20);
const jwt_strategy_1 = __webpack_require__(24);
const clerk_jwt_strategy_1 = __webpack_require__(26);
const jwt_auth_guard_1 = __webpack_require__(23);
const role_guard_1 = __webpack_require__(28);
const clerk_webhook_controller_1 = __webpack_require__(30);
const user_repository_1 = __webpack_require__(13);
const role_repository_1 = __webpack_require__(18);
const audit_repository_1 = __webpack_require__(19);
const database_1 = __webpack_require__(14);
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            passport_1.PassportModule.register({ defaultStrategy: 'clerk-jwt' }),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    secret: configService.get('JWT_SECRET', 'default-jwt-secret'),
                    signOptions: {
                        expiresIn: configService.get('JWT_EXPIRES_IN', '24h'),
                    },
                }),
                inject: [config_1.ConfigService],
            }),
            config_1.ConfigModule,
        ],
        controllers: [auth_controller_1.AuthController, clerk_webhook_controller_1.ClerkWebhookController],
        providers: [
            auth_service_1.AuthService,
            jwt_strategy_1.JwtStrategy,
            clerk_jwt_strategy_1.ClerkJwtStrategy,
            jwt_auth_guard_1.JwtAuthGuard,
            role_guard_1.RoleGuard,
            user_repository_1.UserRepository,
            role_repository_1.RoleRepository,
            audit_repository_1.AuditRepository,
            database_1.PrismaService,
        ],
        exports: [auth_service_1.AuthService, jwt_auth_guard_1.JwtAuthGuard, role_guard_1.RoleGuard],
    })
], AuthModule);


/***/ }),
/* 10 */
/***/ ((module) => {

module.exports = require("@nestjs/jwt");

/***/ }),
/* 11 */
/***/ ((module) => {

module.exports = require("@nestjs/passport");

/***/ }),
/* 12 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthService = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const jwt_1 = __webpack_require__(10);
const config_1 = __webpack_require__(6);
const user_repository_1 = __webpack_require__(13);
const role_repository_1 = __webpack_require__(18);
const audit_repository_1 = __webpack_require__(19);
let AuthService = class AuthService {
    constructor(userRepository, roleRepository, auditRepository, jwtService, configService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.auditRepository = auditRepository;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async validateClerkUser(clerkUserId) {
        let user = await this.userRepository.findByClerkId(clerkUserId);
        if (!user) {
            // Try to get Clerk client if available
            let clerkUser;
            try {
                const clerkSecretKey = this.configService.get('CLERK_SECRET_KEY');
                if (clerkSecretKey) {
                    const { createClerkClient } = await Promise.resolve(/* import() */).then(__webpack_require__.t.bind(__webpack_require__, 61, 23));
                    // Create configured Clerk client with secret key
                    const clerkClient = createClerkClient({
                        secretKey: clerkSecretKey,
                        apiUrl: this.configService.get('CLERK_API_URL') || 'https://api.clerk.com'
                    });
                    clerkUser = await clerkClient.users.getUser(clerkUserId);
                }
                else {
                    throw new Error('Clerk not configured');
                }
            }
            catch (error) {
                console.warn('Clerk client not available:', error);
                return null;
            }
            const customerRole = await this.roleRepository.findByName('CUSTOMER');
            if (!customerRole) {
                throw new Error('Customer role not found in database');
            }
            user = await this.userRepository.create({
                clerkId: clerkUserId,
                email: clerkUser.emailAddresses[0].emailAddress,
                firstName: clerkUser.firstName || '',
                lastName: clerkUser.lastName || '',
                roleId: customerRole.id,
            });
            await this.auditRepository.create({
                userId: user.id,
                action: 'USER_CREATED',
                entityType: 'user',
                entityId: user.id,
                details: { source: 'clerk_webhook' },
            });
        }
        return user;
    }
    async login(email, password) {
        // Since we're using Clerk for authentication, this method is deprecated
        // It's kept for backward compatibility or local testing without Clerk
        throw new common_1.UnauthorizedException('Please use Clerk authentication through the UI');
    }
    async register(data) {
        // Since we're using Clerk for authentication, this method is deprecated
        // Registration should be done through Clerk UI
        throw new common_1.ConflictException('Please use Clerk registration through the UI');
    }
    async validateToken(token) {
        try {
            const payload = this.jwtService.verify(token);
            const user = await this.userRepository.findById(payload.sub);
            if (!user || !user.isActive) {
                throw new common_1.UnauthorizedException('Invalid token');
            }
            return user;
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid token');
        }
    }
    async generateJWT(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role?.name || 'CUSTOMER',
        };
        return this.jwtService.sign(payload);
    }
    async syncUserFromClerk(data) {
        // Check if user already exists
        let user = await this.userRepository.findByClerkId(data.clerkId);
        if (!user) {
            // Check if email exists with different clerkId
            const emailUser = await this.userRepository.findByEmail(data.email);
            if (emailUser && emailUser.clerkId && emailUser.clerkId !== data.clerkId) {
                throw new common_1.ConflictException('Email already registered with different account');
            }
            // Get customer role
            const customerRole = await this.roleRepository.findByName('CUSTOMER');
            if (!customerRole) {
                throw new Error('Customer role not found in database');
            }
            // Create new user
            user = await this.userRepository.create({
                clerkId: data.clerkId,
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
                roleId: customerRole.id,
            });
            await this.auditRepository.create({
                userId: user.id,
                action: 'USER_SYNCED',
                entityType: 'user',
                entityId: user.id,
                details: { source: 'clerk_sync' },
            });
        }
        else {
            // Update existing user if needed
            if (user.email !== data.email ||
                user.firstName !== data.firstName ||
                user.lastName !== data.lastName) {
                user = await this.userRepository.update(user.id, {
                    email: data.email,
                    firstName: data.firstName,
                    lastName: data.lastName,
                });
            }
        }
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role || { name: 'CUSTOMER' },
            isActive: user.isActive,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof user_repository_1.UserRepository !== "undefined" && user_repository_1.UserRepository) === "function" ? _a : Object, typeof (_b = typeof role_repository_1.RoleRepository !== "undefined" && role_repository_1.RoleRepository) === "function" ? _b : Object, typeof (_c = typeof audit_repository_1.AuditRepository !== "undefined" && audit_repository_1.AuditRepository) === "function" ? _c : Object, typeof (_d = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _d : Object, typeof (_e = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _e : Object])
], AuthService);


/***/ }),
/* 13 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserRepository = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const database_1 = __webpack_require__(14);
let UserRepository = class UserRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(filters) {
        return this.prisma.user.findMany({
            where: {
                ...filters,
                role: {
                    name: {
                        not: 'CUSTOMER' // Exclude CUSTOMER role users from user management
                    }
                }
            },
            include: {
                role: true,
            },
        });
    }
    async findById(id) {
        return this.prisma.user.findUnique({
            where: { id },
            include: {
                role: true,
            },
        });
    }
    async findByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email },
            include: {
                role: true,
            },
        });
    }
    async findByClerkId(clerkId) {
        return this.prisma.user.findUnique({
            where: { clerkId },
            include: {
                role: true,
            },
        });
    }
    async create(data) {
        return this.prisma.user.create({
            data,
            include: {
                role: true,
            },
        });
    }
    async update(id, data) {
        return this.prisma.user.update({
            where: { id },
            data,
            include: {
                role: true,
            },
        });
    }
    async delete(id) {
        try {
            await this.prisma.user.delete({
                where: { id },
            });
            return true;
        }
        catch (error) {
            return false;
        }
    }
    async assignRole(userId, roleId) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { roleId },
            include: {
                role: true,
            },
        });
    }
    async findAllWithRoles(filters) {
        return this.prisma.user.findMany({
            where: {
                ...filters,
                role: {
                    name: {
                        not: 'CUSTOMER' // Exclude CUSTOMER role users from user management
                    }
                }
            },
            include: {
                role: {
                    include: {
                        permissions: true,
                    },
                },
            },
        });
    }
};
exports.UserRepository = UserRepository;
exports.UserRepository = UserRepository = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object])
], UserRepository);


/***/ }),
/* 14 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(5);
tslib_1.__exportStar(__webpack_require__(15), exports);
tslib_1.__exportStar(__webpack_require__(16), exports);


/***/ }),
/* 15 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DatabaseModule = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const prisma_service_1 = __webpack_require__(16);
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = tslib_1.__decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [prisma_service_1.PrismaService],
        exports: [prisma_service_1.PrismaService],
    })
], DatabaseModule);


/***/ }),
/* 16 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PrismaService = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const client_1 = __webpack_require__(17);
let PrismaService = class PrismaService extends client_1.PrismaClient {
    async onModuleInit() {
        await this.$connect();
    }
    async onModuleDestroy() {
        await this.$disconnect();
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = tslib_1.__decorate([
    (0, common_1.Injectable)()
], PrismaService);


/***/ }),
/* 17 */
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),
/* 18 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RoleRepository = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const database_1 = __webpack_require__(14);
let RoleRepository = class RoleRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.role.findMany();
    }
    async findById(id) {
        return this.prisma.role.findUnique({
            where: { id },
        });
    }
    async findByName(name) {
        return this.prisma.role.findUnique({
            where: { name: name },
        });
    }
    async getPermissions(roleId) {
        const rolePermissions = await this.prisma.rolePermission.findMany({
            where: { roleId },
            include: {
                permission: true,
            },
        });
        return rolePermissions.map(rp => rp.permission);
    }
    async hasPermission(roleId, permissionName) {
        // Simplified version - just check if role has any permissions
        const rolePermissions = await this.prisma.rolePermission.count({
            where: {
                roleId,
            },
        });
        return rolePermissions > 0;
    }
};
exports.RoleRepository = RoleRepository;
exports.RoleRepository = RoleRepository = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object])
], RoleRepository);


/***/ }),
/* 19 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuditRepository = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const database_1 = __webpack_require__(14);
let AuditRepository = class AuditRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.auditLog.create({
            data: {
                userId: data.userId,
                action: data.action,
                resource: data.entityType || data.resource || 'unknown',
                resourceId: data.entityId || data.resourceId || '',
                oldValue: data.oldValue || undefined,
                newValue: data.newValue || data.details || undefined,
                ipAddress: data.ipAddress,
            },
        });
    }
    async findByUser(userId, limit = 100) {
        return this.prisma.auditLog.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
    async findByAction(action, limit = 100) {
        return this.prisma.auditLog.findMany({
            where: { action },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
    async findByEntity(entityType, entityId) {
        return this.prisma.auditLog.findMany({
            where: {
                resource: entityType,
                resourceId: entityId,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findAll(filters) {
        const where = {};
        if (filters?.userId)
            where.userId = filters.userId;
        if (filters?.action)
            where.action = filters.action;
        if (filters?.entityType)
            where.resource = filters.entityType;
        if (filters?.startDate || filters?.endDate) {
            where.createdAt = {};
            if (filters?.startDate)
                where.createdAt.gte = filters.startDate;
            if (filters?.endDate)
                where.createdAt.lte = filters.endDate;
        }
        return this.prisma.auditLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.AuditRepository = AuditRepository;
exports.AuditRepository = AuditRepository = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object])
], AuditRepository);


/***/ }),
/* 20 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthController = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const auth_service_1 = __webpack_require__(12);
const public_decorator_1 = __webpack_require__(21);
const current_user_decorator_1 = __webpack_require__(22);
const jwt_auth_guard_1 = __webpack_require__(23);
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async login(loginDto) {
        return this.authService.login(loginDto.email, loginDto.password);
    }
    async register(registerDto) {
        return this.authService.register(registerDto);
    }
    async getCurrentUser(user) {
        return user;
    }
    async logout(user) {
        // In a JWT-based system, logout is typically handled on the client side
        // by removing the token. Here we can log the logout action.
        return { message: 'Logged out successfully' };
    }
    async refreshToken(body) {
        // Implement refresh token logic if needed
        return { message: 'Token refresh not implemented yet' };
    }
    async syncUser(syncDto) {
        // Sync user from Clerk to our database
        return this.authService.syncUserFromClerk(syncDto);
    }
};
exports.AuthController = AuthController;
tslib_1.__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
tslib_1.__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('register'),
    tslib_1.__param(0, (0, common_1.Body)(new common_1.ValidationPipe())),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('me'),
    tslib_1.__param(0, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "getCurrentUser", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    tslib_1.__param(0, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
tslib_1.__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('refresh'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('sync'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "syncUser", null);
exports.AuthController = AuthController = tslib_1.__decorate([
    (0, common_1.Controller)('api/auth'),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _a : Object])
], AuthController);


/***/ }),
/* 21 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Public = exports.IS_PUBLIC_KEY = void 0;
const common_1 = __webpack_require__(2);
exports.IS_PUBLIC_KEY = 'isPublic';
const Public = () => (0, common_1.SetMetadata)(exports.IS_PUBLIC_KEY, true);
exports.Public = Public;


/***/ }),
/* 22 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CurrentUser = void 0;
const common_1 = __webpack_require__(2);
exports.CurrentUser = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
});


/***/ }),
/* 23 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtAuthGuard = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const core_1 = __webpack_require__(3);
const passport_1 = __webpack_require__(11);
const public_decorator_1 = __webpack_require__(21);
let JwtAuthGuard = class JwtAuthGuard extends (0, passport_1.AuthGuard)(['clerk-jwt', 'jwt']) {
    constructor(reflector) {
        super();
        this.reflector = reflector;
    }
    canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(public_decorator_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        // In development mode, check for mock token
        if (process.env.NODE_ENV === 'development') {
            const request = context.switchToHttp().getRequest();
            const authHeader = request.headers.authorization;
            if (authHeader === 'Bearer mock-jwt-token-development') {
                // Set mock user for development
                request.user = {
                    id: 'dev-user-1',
                    email: 'customer@example.com',
                    role: { name: 'STAFF' }, // Give STAFF role for testing invoice creation
                    firstName: 'Test',
                    lastName: 'User',
                    customerId: 'dev-customer-1',
                };
                return true;
            }
        }
        return super.canActivate(context);
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof core_1.Reflector !== "undefined" && core_1.Reflector) === "function" ? _a : Object])
], JwtAuthGuard);


/***/ }),
/* 24 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtStrategy = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const passport_1 = __webpack_require__(11);
const passport_jwt_1 = __webpack_require__(25);
const config_1 = __webpack_require__(6);
const user_repository_1 = __webpack_require__(13);
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    constructor(configService, userRepository) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_SECRET', 'default-jwt-secret'),
        });
        this.userRepository = userRepository;
    }
    async validate(payload) {
        // Development mode bypass for mock token
        if (process.env.NODE_ENV === 'development' && payload === 'mock-jwt-token-development') {
            // Return a mock user for development
            return {
                id: 'dev-user-1',
                email: 'customer@example.com',
                role: { name: 'CUSTOMER' },
                firstName: 'Test',
                lastName: 'Customer',
                customerId: 'dev-customer-1',
            };
        }
        const user = await this.userRepository.findById(payload.sub);
        if (!user || !user.isActive) {
            throw new common_1.UnauthorizedException('User not found or inactive');
        }
        return {
            id: user.id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
        };
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object, typeof (_b = typeof user_repository_1.UserRepository !== "undefined" && user_repository_1.UserRepository) === "function" ? _b : Object])
], JwtStrategy);


/***/ }),
/* 25 */
/***/ ((module) => {

module.exports = require("passport-jwt");

/***/ }),
/* 26 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ClerkJwtStrategy = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const passport_1 = __webpack_require__(11);
const passport_jwt_1 = __webpack_require__(25);
const config_1 = __webpack_require__(6);
const user_repository_1 = __webpack_require__(13);
const jwks_rsa_1 = __webpack_require__(27);
const database_1 = __webpack_require__(14);
let ClerkJwtStrategy = class ClerkJwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy, 'clerk-jwt') {
    constructor(userRepository, prismaService, configService) {
        const jwksUrl = configService.get('CLERK_JWKS_URL', 'https://clean-dove-53.clerk.accounts.dev/.well-known/jwks.json');
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKeyProvider: (0, jwks_rsa_1.passportJwtSecret)({
                cache: true,
                rateLimit: true,
                jwksRequestsPerMinute: 5,
                jwksUri: jwksUrl,
            }),
            algorithms: ['RS256'],
        });
        this.userRepository = userRepository;
        this.prismaService = prismaService;
        this.configService = configService;
    }
    async validate(payload) {
        console.log('Clerk JWT payload:', JSON.stringify(payload, null, 2));
        // Clerk JWT payload contains 'sub' as the Clerk user ID
        const clerkUserId = payload.sub;
        if (!clerkUserId) {
            throw new common_1.UnauthorizedException('Invalid token: no user ID');
        }
        // Find user by Clerk ID
        let user = await this.userRepository.findByClerkId(clerkUserId);
        if (!user) {
            // Auto-create user if they don't exist by fetching from Clerk API
            let clerkUser;
            try {
                const clerkSecretKey = this.configService.get('CLERK_SECRET_KEY');
                if (clerkSecretKey) {
                    const { createClerkClient } = await Promise.resolve(/* import() */).then(__webpack_require__.t.bind(__webpack_require__, 61, 23));
                    const clerkClient = createClerkClient({
                        secretKey: clerkSecretKey,
                        apiUrl: this.configService.get('CLERK_API_URL') || 'https://api.clerk.com'
                    });
                    clerkUser = await clerkClient.users.getUser(clerkUserId);
                    console.log('Fetched user from Clerk API:', clerkUser);
                }
                else {
                    throw new common_1.UnauthorizedException('Clerk not configured - missing CLERK_SECRET_KEY');
                }
            }
            catch (error) {
                console.error('Error fetching user from Clerk:', error);
                throw new common_1.UnauthorizedException('Failed to fetch user details from Clerk');
            }
            if (!clerkUser || !clerkUser.emailAddresses || clerkUser.emailAddresses.length === 0) {
                throw new common_1.UnauthorizedException('User has no email addresses in Clerk');
            }
            const email = clerkUser.emailAddresses[0].emailAddress;
            const firstName = clerkUser.firstName || 'User';
            const lastName = clerkUser.lastName || '';
            // Determine role based on email
            let roleName = 'CUSTOMER'; // Default to customer role
            if (email === 'vishal.alawalpuria@gmail.com') {
                roleName = 'ADMIN'; // Admin role
            }
            // Look up the role ID by name
            const role = await this.prismaService.role.findUnique({
                where: { name: roleName }
            });
            if (!role) {
                throw new common_1.UnauthorizedException(`Role ${roleName} not found in database`);
            }
            try {
                user = await this.userRepository.create({
                    clerkId: clerkUserId,
                    email,
                    firstName,
                    lastName,
                    roleId: role.id,
                });
                console.log('Created new user from Clerk data:', user);
            }
            catch (error) {
                console.error('Error creating user:', error);
                // If creation fails, maybe the user was created in parallel
                user = await this.userRepository.findByClerkId(clerkUserId);
                if (!user) {
                    throw new common_1.UnauthorizedException('Failed to create or find user');
                }
            }
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('User account is inactive');
        }
        // Return user with role information
        return {
            id: user.id,
            clerkId: user.clerkId,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isActive: user.isActive,
        };
    }
};
exports.ClerkJwtStrategy = ClerkJwtStrategy;
exports.ClerkJwtStrategy = ClerkJwtStrategy = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof user_repository_1.UserRepository !== "undefined" && user_repository_1.UserRepository) === "function" ? _a : Object, typeof (_b = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _b : Object, typeof (_c = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _c : Object])
], ClerkJwtStrategy);


/***/ }),
/* 27 */
/***/ ((module) => {

module.exports = require("jwks-rsa");

/***/ }),
/* 28 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RoleGuard = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const core_1 = __webpack_require__(3);
const roles_decorator_1 = __webpack_require__(29);
let RoleGuard = class RoleGuard {
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const requiredRoles = this.reflector.getAllAndOverride(roles_decorator_1.ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles) {
            return true;
        }
        const { user } = context.switchToHttp().getRequest();
        if (!user || !user.role) {
            return false;
        }
        return requiredRoles.includes(user.role.name);
    }
};
exports.RoleGuard = RoleGuard;
exports.RoleGuard = RoleGuard = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof core_1.Reflector !== "undefined" && core_1.Reflector) === "function" ? _a : Object])
], RoleGuard);


/***/ }),
/* 29 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Roles = exports.ROLES_KEY = void 0;
const common_1 = __webpack_require__(2);
exports.ROLES_KEY = 'roles';
const Roles = (...roles) => (0, common_1.SetMetadata)(exports.ROLES_KEY, roles);
exports.Roles = Roles;


/***/ }),
/* 30 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ClerkWebhookController = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const config_1 = __webpack_require__(6);
const svix_1 = __webpack_require__(31);
const auth_service_1 = __webpack_require__(12);
const public_decorator_1 = __webpack_require__(21);
let ClerkWebhookController = class ClerkWebhookController {
    constructor(authService, configService) {
        this.authService = authService;
        this.configService = configService;
    }
    async handleClerkWebhook(body, svixId, svixTimestamp, svixSignature) {
        const webhookSecret = this.configService.get('CLERK_WEBHOOK_SECRET');
        if (!webhookSecret) {
            console.warn('Clerk webhook secret not configured, skipping webhook processing');
            return { received: true, message: 'Webhook not configured' };
        }
        const wh = new svix_1.Webhook(webhookSecret);
        let evt;
        try {
            evt = wh.verify(JSON.stringify(body), {
                'svix-id': svixId,
                'svix-timestamp': svixTimestamp,
                'svix-signature': svixSignature,
            });
        }
        catch (err) {
            throw new common_1.BadRequestException('Invalid webhook signature');
        }
        switch (evt.type) {
            case 'user.created':
            case 'user.updated':
                await this.handleUserEvent(evt);
                break;
            case 'user.deleted':
                await this.handleUserDeleted(evt);
                break;
            default:
                console.log(`Unhandled webhook event type: ${evt.type}`);
        }
        return { received: true };
    }
    async handleUserEvent(evt) {
        const { id, email_addresses } = evt.data;
        if (!email_addresses || email_addresses.length === 0) {
            return;
        }
        await this.authService.validateClerkUser(id);
    }
    async handleUserDeleted(evt) {
        const { id } = evt.data;
        // Implement user deactivation logic
        console.log(`User ${id} deleted in Clerk`);
    }
};
exports.ClerkWebhookController = ClerkWebhookController;
tslib_1.__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('clerk'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__param(1, (0, common_1.Headers)('svix-id')),
    tslib_1.__param(2, (0, common_1.Headers)('svix-timestamp')),
    tslib_1.__param(3, (0, common_1.Headers)('svix-signature')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String, String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], ClerkWebhookController.prototype, "handleClerkWebhook", null);
exports.ClerkWebhookController = ClerkWebhookController = tslib_1.__decorate([
    (0, common_1.Controller)('api/webhooks'),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _a : Object, typeof (_b = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _b : Object])
], ClerkWebhookController);


/***/ }),
/* 31 */
/***/ ((module) => {

module.exports = require("svix");

/***/ }),
/* 32 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UsersModule = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const users_service_1 = __webpack_require__(33);
const users_controller_1 = __webpack_require__(34);
const user_repository_1 = __webpack_require__(13);
const role_repository_1 = __webpack_require__(18);
const audit_repository_1 = __webpack_require__(19);
const database_1 = __webpack_require__(14);
let UsersModule = class UsersModule {
};
exports.UsersModule = UsersModule;
exports.UsersModule = UsersModule = tslib_1.__decorate([
    (0, common_1.Module)({
        controllers: [users_controller_1.UsersController],
        providers: [
            users_service_1.UsersService,
            user_repository_1.UserRepository,
            role_repository_1.RoleRepository,
            audit_repository_1.AuditRepository,
            database_1.PrismaService,
        ],
        exports: [users_service_1.UsersService, user_repository_1.UserRepository],
    })
], UsersModule);


/***/ }),
/* 33 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UsersService = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const config_1 = __webpack_require__(6);
const user_repository_1 = __webpack_require__(13);
const role_repository_1 = __webpack_require__(18);
const audit_repository_1 = __webpack_require__(19);
// import * as bcrypt from 'bcryptjs'; // Currently unused
let UsersService = class UsersService {
    constructor(userRepository, roleRepository, auditRepository, configService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.auditRepository = auditRepository;
        this.configService = configService;
    }
    async findAll(filters) {
        return this.userRepository.findAll(filters);
    }
    async findById(id) {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async findByEmail(email) {
        return this.userRepository.findByEmail(email);
    }
    async create(data) {
        const existingUser = await this.userRepository.findByEmail(data.email);
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const role = await this.roleRepository.findById(data.roleId);
        if (!role) {
            throw new common_1.NotFoundException('Role not found');
        }
        // const hashedPassword = data.password 
        //   ? await bcrypt.hash(data.password, 10)
        //   : undefined;
        const user = await this.userRepository.create({
            clerkId: '', // Will need proper Clerk ID if using Clerk
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            roleId: data.roleId,
        });
        await this.auditRepository.create({
            userId: data.createdBy,
            action: 'USER_CREATED',
            entityType: 'user',
            entityId: user.id,
            details: { email: data.email, roleId: data.roleId },
        });
        return user;
    }
    async createAdminOrStaff(data) {
        // Check if user already exists in our database
        const existingUser = await this.userRepository.findByEmail(data.email);
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        // Get role by name
        const role = await this.roleRepository.findByName(data.roleName);
        if (!role) {
            throw new common_1.NotFoundException(`Role ${data.roleName} not found`);
        }
        let clerkUserId = null;
        // Create user in Clerk if configured
        const clerkSecretKey = this.configService.get('CLERK_SECRET_KEY');
        if (clerkSecretKey) {
            try {
                const { createClerkClient } = await Promise.resolve(/* import() */).then(__webpack_require__.t.bind(__webpack_require__, 61, 23));
                // Create configured Clerk client with secret key
                const clerkClient = createClerkClient({
                    secretKey: clerkSecretKey,
                    apiUrl: this.configService.get('CLERK_API_URL') || 'https://api.clerk.com'
                });
                const clerkUser = await clerkClient.users.createUser({
                    emailAddress: [data.email],
                    username: data.username,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    password: data.password,
                });
                clerkUserId = clerkUser.id;
                // Set metadata for role
                await clerkClient.users.updateUserMetadata(clerkUserId, {
                    publicMetadata: {
                        role: data.roleName,
                    },
                });
            }
            catch (clerkError) {
                console.error('Failed to create user in Clerk:', clerkError);
                throw new common_1.InternalServerErrorException(`Failed to create user in Clerk: ${clerkError.message}`);
            }
        }
        // Create user in our database
        const user = await this.userRepository.create({
            clerkId: clerkUserId || '',
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            roleId: role.id,
        });
        // Create audit log
        await this.auditRepository.create({
            userId: data.createdBy,
            action: 'ADMIN_STAFF_USER_CREATED',
            entityType: 'user',
            entityId: user.id,
            details: {
                email: data.email,
                role: data.roleName,
                clerkId: clerkUserId,
            },
        });
        return {
            ...user,
            clerkCreated: !!clerkUserId,
        };
    }
    async update(id, data) {
        const user = await this.findById(id);
        if (data.email && data.email !== user.email) {
            const existingUser = await this.userRepository.findByEmail(data.email);
            if (existingUser) {
                throw new common_1.ConflictException('Email already in use');
            }
        }
        const updatedUser = await this.userRepository.update(id, {
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            isActive: data.isActive,
        });
        await this.auditRepository.create({
            userId: data.updatedBy,
            action: 'USER_UPDATED',
            entityType: 'user',
            entityId: id,
            details: data,
        });
        return updatedUser;
    }
    async assignRole(userId, roleId, assignedBy) {
        const user = await this.findById(userId);
        const role = await this.roleRepository.findById(roleId);
        if (!role) {
            throw new common_1.NotFoundException('Role not found');
        }
        // Prevent changing admin users by non-admins
        if (user.role.name === 'ADMIN') {
            const assigningUser = await this.userRepository.findById(assignedBy);
            if (assigningUser?.role.name !== 'ADMIN') {
                throw new common_1.ForbiddenException('Only admins can modify admin users');
            }
        }
        const updatedUser = await this.userRepository.assignRole(userId, roleId);
        await this.auditRepository.create({
            userId: assignedBy,
            action: 'ROLE_ASSIGNED',
            entityType: 'user',
            entityId: userId,
            details: {
                oldRole: user.role.name,
                newRole: role.name
            },
        });
        return updatedUser;
    }
    async delete(id, deletedBy) {
        const user = await this.findById(id);
        // Prevent deleting admin users
        if (user.role.name === 'ADMIN') {
            const deletingUser = await this.userRepository.findById(deletedBy);
            if (deletingUser?.role.name !== 'ADMIN') {
                throw new common_1.ForbiddenException('Only admins can delete admin users');
            }
        }
        // Soft delete by deactivating
        const deactivatedUser = await this.userRepository.update(id, {
            isActive: false,
        });
        await this.auditRepository.create({
            userId: deletedBy,
            action: 'USER_DEACTIVATED',
            entityType: 'user',
            entityId: id,
            details: { email: user.email },
        });
        return deactivatedUser;
    }
    async changePassword(_userId, _oldPassword, _newPassword) {
        // Passwords are managed by Clerk, not our system
        throw new common_1.ForbiddenException('Password management is handled by Clerk authentication system');
    }
    async resetPassword(_userId, _newPassword, _resetBy) {
        // Passwords are managed by Clerk, not our system
        throw new common_1.ForbiddenException('Password management is handled by Clerk authentication system');
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof user_repository_1.UserRepository !== "undefined" && user_repository_1.UserRepository) === "function" ? _a : Object, typeof (_b = typeof role_repository_1.RoleRepository !== "undefined" && role_repository_1.RoleRepository) === "function" ? _b : Object, typeof (_c = typeof audit_repository_1.AuditRepository !== "undefined" && audit_repository_1.AuditRepository) === "function" ? _c : Object, typeof (_d = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _d : Object])
], UsersService);


/***/ }),
/* 34 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UsersController = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const users_service_1 = __webpack_require__(33);
const jwt_auth_guard_1 = __webpack_require__(23);
const role_guard_1 = __webpack_require__(28);
const roles_decorator_1 = __webpack_require__(29);
const current_user_decorator_1 = __webpack_require__(22);
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async findAll(roleId, isActive) {
        const filters = {
            roleId: roleId || undefined,
            isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        };
        return this.usersService.findAll(filters);
    }
    async findById(id) {
        return this.usersService.findById(id);
    }
    async create(createUserDto, currentUser) {
        return this.usersService.create({
            ...createUserDto,
            createdBy: currentUser.id,
        });
    }
    async createAdminOrStaff(createUserDto, currentUser) {
        return this.usersService.createAdminOrStaff({
            ...createUserDto,
            createdBy: currentUser.id,
        });
    }
    async update(id, updateUserDto, currentUser) {
        return this.usersService.update(id, {
            ...updateUserDto,
            updatedBy: currentUser.id,
        });
    }
    async assignRole(id, roleId, currentUser) {
        return this.usersService.assignRole(id, roleId, currentUser.id);
    }
    async delete(id, currentUser) {
        return this.usersService.delete(id, currentUser.id);
    }
    async changePassword(id, body, currentUser) {
        // Users can only change their own password
        if (currentUser.id !== id) {
            throw new Error('You can only change your own password');
        }
        return this.usersService.changePassword(id, body.oldPassword, body.newPassword);
    }
    async resetPassword(id, newPassword, currentUser) {
        return this.usersService.resetPassword(id, newPassword, currentUser.id);
    }
    async getMyProfile(currentUser) {
        return this.usersService.findById(currentUser.id);
    }
    async updateMyProfile(updateProfileDto, currentUser) {
        return this.usersService.update(currentUser.id, {
            ...updateProfileDto,
            updatedBy: currentUser.id,
        });
    }
};
exports.UsersController = UsersController;
tslib_1.__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('ADMIN', 'STAFF'),
    tslib_1.__param(0, (0, common_1.Query)('roleId')),
    tslib_1.__param(1, (0, common_1.Query)('isActive')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], UsersController.prototype, "findAll", null);
tslib_1.__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'STAFF'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], UsersController.prototype, "findById", null);
tslib_1.__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('ADMIN'),
    tslib_1.__param(0, (0, common_1.Body)(new common_1.ValidationPipe())),
    tslib_1.__param(1, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], UsersController.prototype, "create", null);
tslib_1.__decorate([
    (0, common_1.Post)('admin-staff'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    tslib_1.__param(0, (0, common_1.Body)(new common_1.ValidationPipe())),
    tslib_1.__param(1, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], UsersController.prototype, "createAdminOrStaff", null);
tslib_1.__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)(new common_1.ValidationPipe())),
    tslib_1.__param(2, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], UsersController.prototype, "update", null);
tslib_1.__decorate([
    (0, common_1.Put)(':id/role'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)('roleId')),
    tslib_1.__param(2, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], UsersController.prototype, "assignRole", null);
tslib_1.__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], UsersController.prototype, "delete", null);
tslib_1.__decorate([
    (0, common_1.Post)(':id/change-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__param(2, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], UsersController.prototype, "changePassword", null);
tslib_1.__decorate([
    (0, common_1.Post)(':id/reset-password'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)('newPassword')),
    tslib_1.__param(2, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], UsersController.prototype, "resetPassword", null);
tslib_1.__decorate([
    (0, common_1.Get)('profile/me'),
    tslib_1.__param(0, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], UsersController.prototype, "getMyProfile", null);
tslib_1.__decorate([
    (0, common_1.Put)('profile/me'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__param(1, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], UsersController.prototype, "updateMyProfile", null);
exports.UsersController = UsersController = tslib_1.__decorate([
    (0, common_1.Controller)('api/users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, role_guard_1.RoleGuard),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _a : Object])
], UsersController);


/***/ }),
/* 35 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TiresModule = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const tires_controller_1 = __webpack_require__(36);
const tires_service_1 = __webpack_require__(37);
const tire_repository_1 = __webpack_require__(38);
const audit_repository_1 = __webpack_require__(19);
const database_1 = __webpack_require__(14);
let TiresModule = class TiresModule {
};
exports.TiresModule = TiresModule;
exports.TiresModule = TiresModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [database_1.DatabaseModule],
        controllers: [tires_controller_1.TiresController],
        providers: [tires_service_1.TiresService, tire_repository_1.TireRepository, audit_repository_1.AuditRepository],
        exports: [tires_service_1.TiresService, tire_repository_1.TireRepository],
    })
], TiresModule);


/***/ }),
/* 36 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TiresController = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const tires_service_1 = __webpack_require__(37);
const jwt_auth_guard_1 = __webpack_require__(23);
const role_guard_1 = __webpack_require__(28);
const roles_decorator_1 = __webpack_require__(29);
const current_user_decorator_1 = __webpack_require__(22);
const public_decorator_1 = __webpack_require__(21);
const shared_dto_1 = __webpack_require__(41);
const shared_dto_2 = __webpack_require__(41);
const shared_dto_3 = __webpack_require__(41);
const shared_dto_4 = __webpack_require__(41);
let TiresController = class TiresController {
    constructor(tiresService) {
        this.tiresService = tiresService;
    }
    // Public endpoint - customers can view tires
    async findAll(searchDto, user) {
        const userRole = user?.role?.name;
        // If search parameters are provided, use search method
        if (Object.keys(searchDto).length > 0) {
            return this.tiresService.search(searchDto, userRole);
        }
        // Simple findAll for basic requests
        const filters = {
            inStock: true, // Only show in-stock items by default for public
        };
        return this.tiresService.findAll(filters, userRole);
    }
    // Public endpoint - get all tire brands
    async getBrands(user) {
        const userRole = user?.role?.name;
        return this.tiresService.getBrands(userRole);
    }
    // Public endpoint - get all tire models for a brand
    async getModelsForBrand(brand, user) {
        const userRole = user?.role?.name;
        return this.tiresService.getModelsForBrand(brand, userRole);
    }
    // Public endpoint - get all tire sizes
    async getSizes(user) {
        const userRole = user?.role?.name;
        return this.tiresService.getSizes(userRole);
    }
    // Public endpoint - customers can view individual tires
    async findById(id, user) {
        const userRole = user?.role?.name;
        return this.tiresService.findById(id, userRole);
    }
    // Staff and Admin - Create new tire
    async create(createTireDto, user) {
        return this.tiresService.create(createTireDto, user.id, user.role.name);
    }
    // Staff and Admin - Update tire
    async update(id, updateTireDto, user) {
        return this.tiresService.update(id, updateTireDto, user.id, user.role.name);
    }
    // Admin only - Delete tire
    async delete(id, user) {
        return this.tiresService.delete(id, user.id, user.role.name);
    }
    // Staff and Admin - Adjust stock
    async adjustStock(id, adjustmentDto, user) {
        return this.tiresService.adjustStock(id, adjustmentDto, user.id, user.role.name);
    }
    // Staff and Admin - Get low stock items
    async getLowStock(user) {
        return this.tiresService.getLowStock(user.role.name);
    }
    // Admin only - Get inventory report
    async getInventoryReport(startDate, endDate, user) {
        const filters = {
            startDate,
            endDate,
        };
        return this.tiresService.getInventoryReport(filters, user?.role?.name);
    }
    // Staff and Admin - Search by brand and model
    async findByBrandAndModel(brand, model, user) {
        return this.tiresService.findByBrandAndModel(brand, model, user.role.name);
    }
    // Public - Search by size (useful for customers)
    async findBySize(size, type, user) {
        const userRole = user?.role?.name;
        return this.tiresService.findBySizeAndType(size, type, userRole);
    }
    // Staff and Admin - Get stock alerts
    async getStockAlerts() {
        return this.tiresService.checkLowStockAlerts();
    }
};
exports.TiresController = TiresController;
tslib_1.__decorate([
    (0, common_1.Get)(),
    (0, public_decorator_1.Public)(),
    tslib_1.__param(0, (0, common_1.Query)(new common_1.ValidationPipe({ transform: true }))),
    tslib_1.__param(1, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_b = typeof shared_dto_4.TireSearchDto !== "undefined" && shared_dto_4.TireSearchDto) === "function" ? _b : Object, Object]),
    tslib_1.__metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], TiresController.prototype, "findAll", null);
tslib_1.__decorate([
    (0, common_1.Get)('brands'),
    (0, public_decorator_1.Public)(),
    tslib_1.__param(0, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], TiresController.prototype, "getBrands", null);
tslib_1.__decorate([
    (0, common_1.Get)('brands/:brand/models'),
    (0, public_decorator_1.Public)(),
    tslib_1.__param(0, (0, common_1.Param)('brand')),
    tslib_1.__param(1, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], TiresController.prototype, "getModelsForBrand", null);
tslib_1.__decorate([
    (0, common_1.Get)('sizes'),
    (0, public_decorator_1.Public)(),
    tslib_1.__param(0, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], TiresController.prototype, "getSizes", null);
tslib_1.__decorate([
    (0, common_1.Get)(':id'),
    (0, public_decorator_1.Public)(),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], TiresController.prototype, "findById", null);
tslib_1.__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, role_guard_1.RoleGuard),
    (0, roles_decorator_1.Roles)('STAFF', 'ADMIN'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__param(1, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_h = typeof shared_dto_1.CreateTireDto !== "undefined" && shared_dto_1.CreateTireDto) === "function" ? _h : Object, Object]),
    tslib_1.__metadata("design:returntype", typeof (_j = typeof Promise !== "undefined" && Promise) === "function" ? _j : Object)
], TiresController.prototype, "create", null);
tslib_1.__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, role_guard_1.RoleGuard),
    (0, roles_decorator_1.Roles)('STAFF', 'ADMIN'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__param(2, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, typeof (_k = typeof shared_dto_2.UpdateTireDto !== "undefined" && shared_dto_2.UpdateTireDto) === "function" ? _k : Object, Object]),
    tslib_1.__metadata("design:returntype", typeof (_l = typeof Promise !== "undefined" && Promise) === "function" ? _l : Object)
], TiresController.prototype, "update", null);
tslib_1.__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, role_guard_1.RoleGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", typeof (_m = typeof Promise !== "undefined" && Promise) === "function" ? _m : Object)
], TiresController.prototype, "delete", null);
tslib_1.__decorate([
    (0, common_1.Post)(':id/adjust-stock'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, role_guard_1.RoleGuard),
    (0, roles_decorator_1.Roles)('STAFF', 'ADMIN'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__param(2, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, typeof (_o = typeof shared_dto_3.StockAdjustmentDto !== "undefined" && shared_dto_3.StockAdjustmentDto) === "function" ? _o : Object, Object]),
    tslib_1.__metadata("design:returntype", typeof (_p = typeof Promise !== "undefined" && Promise) === "function" ? _p : Object)
], TiresController.prototype, "adjustStock", null);
tslib_1.__decorate([
    (0, common_1.Get)('reports/low-stock'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, role_guard_1.RoleGuard),
    (0, roles_decorator_1.Roles)('STAFF', 'ADMIN'),
    tslib_1.__param(0, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", typeof (_q = typeof Promise !== "undefined" && Promise) === "function" ? _q : Object)
], TiresController.prototype, "getLowStock", null);
tslib_1.__decorate([
    (0, common_1.Get)('reports/inventory'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, role_guard_1.RoleGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    tslib_1.__param(0, (0, common_1.Query)('startDate')),
    tslib_1.__param(1, (0, common_1.Query)('endDate')),
    tslib_1.__param(2, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, Object]),
    tslib_1.__metadata("design:returntype", typeof (_r = typeof Promise !== "undefined" && Promise) === "function" ? _r : Object)
], TiresController.prototype, "getInventoryReport", null);
tslib_1.__decorate([
    (0, common_1.Get)('search/brand/:brand/model/:model'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, role_guard_1.RoleGuard),
    (0, roles_decorator_1.Roles)('STAFF', 'ADMIN'),
    tslib_1.__param(0, (0, common_1.Param)('brand')),
    tslib_1.__param(1, (0, common_1.Param)('model')),
    tslib_1.__param(2, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, Object]),
    tslib_1.__metadata("design:returntype", typeof (_s = typeof Promise !== "undefined" && Promise) === "function" ? _s : Object)
], TiresController.prototype, "findByBrandAndModel", null);
tslib_1.__decorate([
    (0, common_1.Get)('search/size/:size'),
    (0, public_decorator_1.Public)(),
    tslib_1.__param(0, (0, common_1.Param)('size')),
    tslib_1.__param(1, (0, common_1.Query)('type')),
    tslib_1.__param(2, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, Object]),
    tslib_1.__metadata("design:returntype", typeof (_t = typeof Promise !== "undefined" && Promise) === "function" ? _t : Object)
], TiresController.prototype, "findBySize", null);
tslib_1.__decorate([
    (0, common_1.Get)('alerts/low-stock'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, role_guard_1.RoleGuard),
    (0, roles_decorator_1.Roles)('STAFF', 'ADMIN'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", typeof (_u = typeof Promise !== "undefined" && Promise) === "function" ? _u : Object)
], TiresController.prototype, "getStockAlerts", null);
exports.TiresController = TiresController = tslib_1.__decorate([
    (0, common_1.Controller)('api/tires'),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof tires_service_1.TiresService !== "undefined" && tires_service_1.TiresService) === "function" ? _a : Object])
], TiresController);


/***/ }),
/* 37 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TiresService = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const tire_repository_1 = __webpack_require__(38);
const audit_repository_1 = __webpack_require__(19);
const library_1 = __webpack_require__(40);
let TiresService = class TiresService {
    constructor(tireRepository, auditRepository) {
        this.tireRepository = tireRepository;
        this.auditRepository = auditRepository;
    }
    async findAll(filters, userRole) {
        const tires = await this.tireRepository.findAll(filters);
        return this.formatTireResponse(tires, userRole);
    }
    async findById(id, userRole) {
        const tire = await this.tireRepository.findById(id);
        if (!tire) {
            throw new common_1.NotFoundException('Tire not found');
        }
        return this.formatSingleTireResponse(tire, userRole);
    }
    async search(searchParams, userRole) {
        const result = await this.tireRepository.search(searchParams);
        return {
            items: this.formatTireResponse(result.items, userRole),
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
            hasMore: result.hasMore,
        };
    }
    async create(createTireDto, userId, userRole) {
        // Check if user has permission to create tires
        if (!['STAFF', 'ADMIN'].includes(userRole)) {
            throw new common_1.ForbiddenException('Insufficient permissions to create tires');
        }
        // Check for duplicates (same brand, size, type, condition)
        const existingTires = await this.tireRepository.findAll({
            brand: createTireDto.brand,
            size: createTireDto.size,
            type: createTireDto.type,
            condition: createTireDto.condition,
        });
        if (existingTires.length > 0) {
            throw new common_1.ConflictException('Tire with the same specifications already exists. Consider updating the quantity instead.');
        }
        // Set default values
        const tireData = {
            ...createTireDto,
            minStock: createTireDto.minStock || 5,
            price: new library_1.Decimal(createTireDto.price),
            cost: createTireDto.cost ? new library_1.Decimal(createTireDto.cost) : null,
        };
        const tire = await this.tireRepository.create(tireData);
        // Log the creation
        await this.auditRepository.create({
            userId,
            action: 'TIRE_CREATED',
            entityType: 'tire',
            entityId: tire.id,
            details: {
                brand: tire.brand,
                size: tire.size,
                quantity: tire.quantity,
            },
        });
        return this.formatSingleTireResponse(tire, userRole);
    }
    async update(id, updateTireDto, userId, userRole) {
        // Check if user has permission to update tires
        if (!['STAFF', 'ADMIN'].includes(userRole)) {
            throw new common_1.ForbiddenException('Insufficient permissions to update tires');
        }
        const existingTire = await this.findById(id, userRole);
        // Prepare update data
        const updateData = { ...updateTireDto };
        if (updateTireDto.price !== undefined) {
            updateData.price = new library_1.Decimal(updateTireDto.price);
        }
        if (updateTireDto.cost !== undefined) {
            updateData.cost = new library_1.Decimal(updateTireDto.cost);
        }
        const updatedTire = await this.tireRepository.update(id, updateData);
        // Log the update
        await this.auditRepository.create({
            userId,
            action: 'TIRE_UPDATED',
            entityType: 'tire',
            entityId: id,
            details: {
                changes: updateTireDto,
                oldValues: {
                    brand: existingTire.brand,
                    price: existingTire.price,
                },
            },
        });
        return this.formatSingleTireResponse(updatedTire, userRole);
    }
    async delete(id, userId, userRole) {
        // Only admin can delete tires
        if (userRole !== 'ADMIN') {
            throw new common_1.ForbiddenException('Only administrators can delete tires');
        }
        const tire = await this.findById(id, userRole);
        // Check if tire has been used in any invoices
        // TODO: Add check for invoice items when invoice module is implemented
        const success = await this.tireRepository.delete(id);
        if (!success) {
            throw new common_1.BadRequestException('Failed to delete tire');
        }
        // Log the deletion
        await this.auditRepository.create({
            userId,
            action: 'TIRE_DELETED',
            entityType: 'tire',
            entityId: id,
            details: {
                brand: tire.brand,
                size: tire.size,
            },
        });
        return { success: true };
    }
    async adjustStock(id, adjustmentDto, userId, userRole) {
        // Check if user has permission to adjust stock
        if (!['STAFF', 'ADMIN'].includes(userRole)) {
            throw new common_1.ForbiddenException('Insufficient permissions to adjust stock');
        }
        const existingTire = await this.findById(id, userRole);
        // Validate adjustment
        if (adjustmentDto.type === 'remove' && adjustmentDto.quantity > existingTire.quantity) {
            throw new common_1.BadRequestException(`Cannot remove ${adjustmentDto.quantity} items. Only ${existingTire.quantity} in stock.`);
        }
        if (adjustmentDto.quantity < 0 && adjustmentDto.type !== 'remove') {
            throw new common_1.BadRequestException('Quantity cannot be negative for add/set operations');
        }
        const oldQuantity = existingTire.quantity;
        const updatedTire = await this.tireRepository.adjustStock(id, {
            quantity: Math.abs(adjustmentDto.quantity),
            type: adjustmentDto.type,
        });
        // Log the stock adjustment
        await this.auditRepository.create({
            userId,
            action: 'STOCK_ADJUSTED',
            entityType: 'tire',
            entityId: id,
            details: {
                type: adjustmentDto.type,
                quantity: adjustmentDto.quantity,
                reason: adjustmentDto.reason,
                oldQuantity,
                newQuantity: updatedTire.quantity,
                brand: updatedTire.brand,
                size: updatedTire.size,
            },
        });
        return this.formatSingleTireResponse(updatedTire, userRole);
    }
    async getLowStock(userRole) {
        // Check if user has permission to view stock reports
        if (!['STAFF', 'ADMIN'].includes(userRole)) {
            throw new common_1.ForbiddenException('Insufficient permissions to view stock reports');
        }
        const lowStockTires = await this.tireRepository.findLowStock();
        return this.formatTireResponse(lowStockTires, userRole);
    }
    async getInventoryReport(filters, userRole) {
        // Only admin can view inventory reports
        if (userRole !== 'ADMIN') {
            throw new common_1.ForbiddenException('Only administrators can view inventory reports');
        }
        const dateFilters = {
            startDate: filters?.startDate ? new Date(filters.startDate) : undefined,
            endDate: filters?.endDate ? new Date(filters.endDate) : undefined,
        };
        const report = await this.tireRepository.getInventoryReport(dateFilters);
        return {
            ...report,
            lowStockItems: this.formatTireResponse(report.lowStockItems, userRole),
        };
    }
    formatTireResponse(tires, userRole) {
        return tires.map((tire) => this.formatSingleTireResponse(tire, userRole));
    }
    formatSingleTireResponse(tire, userRole) {
        const response = {
            ...tire,
            price: tire.price.toNumber ? tire.price.toNumber() : tire.price,
            cost: tire.cost?.toNumber ? tire.cost.toNumber() : tire.cost,
            isLowStock: tire.quantity <= tire.minStock,
        };
        // Hide cost from non-admin users
        if (userRole !== 'ADMIN') {
            delete response.cost;
        }
        return response;
    }
    // Helper methods for specific searches
    async findByBrandAndModel(brand, model, userRole) {
        const tires = await this.tireRepository.findByBrandAndModel(brand, model);
        return this.formatTireResponse(tires, userRole);
    }
    async findBySizeAndType(size, type, userRole) {
        const tires = await this.tireRepository.findBySizeAndType(size, type);
        return this.formatTireResponse(tires, userRole);
    }
    // Utility method to check low stock alerts
    async checkLowStockAlerts() {
        const lowStockTires = await this.tireRepository.findLowStock();
        return this.formatTireResponse(lowStockTires, 'admin');
    }
    // Get all unique brands
    async getBrands(userRole) {
        return this.tireRepository.getBrands();
    }
    // Get all models for a specific brand
    async getModelsForBrand(brand, userRole) {
        return this.tireRepository.getModelsForBrand(brand);
    }
    // Get all unique sizes
    async getSizes(userRole) {
        return this.tireRepository.getSizes();
    }
};
exports.TiresService = TiresService;
exports.TiresService = TiresService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof tire_repository_1.TireRepository !== "undefined" && tire_repository_1.TireRepository) === "function" ? _a : Object, typeof (_b = typeof audit_repository_1.AuditRepository !== "undefined" && audit_repository_1.AuditRepository) === "function" ? _b : Object])
], TiresService);


/***/ }),
/* 38 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TireRepository = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const database_1 = __webpack_require__(14);
const base_repository_1 = __webpack_require__(39);
let TireRepository = class TireRepository extends base_repository_1.BaseRepository {
    constructor(prisma) {
        super(prisma, 'tire');
    }
    async findAll(filters) {
        return this.prisma.tire.findMany({
            where: this.buildWhereClause(filters),
            orderBy: { updatedAt: 'desc' },
        });
    }
    async findById(id) {
        return this.prisma.tire.findUnique({
            where: { id },
        });
    }
    async create(data) {
        return this.prisma.tire.create({
            data,
        });
    }
    async update(id, data) {
        return this.prisma.tire.update({
            where: { id },
            data,
        });
    }
    async delete(id) {
        try {
            await this.prisma.tire.delete({
                where: { id },
            });
            return true;
        }
        catch (error) {
            return false;
        }
    }
    async search(params) {
        const { search, sortBy = 'updatedAt', sortOrder = 'desc', page = 1, limit = 20, ...filterParams } = params;
        // Use the filter params directly from TireSearchDto which extends TireFiltersDto
        // Ensure page and limit are numbers
        const pageNumber = typeof page === 'string' ? parseInt(page, 10) : page;
        const limitNumber = typeof limit === 'string' ? parseInt(limit, 10) : limit;
        const skip = (pageNumber - 1) * limitNumber;
        const where = this.buildWhereClause(filterParams, search);
        const [items, total] = await Promise.all([
            this.prisma.tire.findMany({
                where,
                orderBy: { [sortBy]: sortOrder },
                skip,
                take: limitNumber,
            }),
            this.prisma.tire.count({ where }),
        ]);
        // Convert Prisma Decimal to number and handle null/undefined for compatibility with TireDto
        const convertedItems = items.map(tire => ({
            ...tire,
            price: parseFloat(tire.price.toString()),
            cost: tire.cost ? parseFloat(tire.cost.toString()) : undefined,
            location: tire.location || undefined, // Convert null to undefined
            imageUrl: tire.imageUrl || undefined, // Convert null to undefined
            type: tire.type, // Convert Prisma enum to DTO enum
            condition: tire.condition, // Convert Prisma enum to DTO enum
            inStock: tire.quantity > 0, // Calculate inStock based on quantity
            createdBy: 'system', // Default value since Prisma model doesn't have this field
            createdAt: tire.createdAt.toISOString(),
            updatedAt: tire.updatedAt.toISOString(),
        }));
        return {
            items: convertedItems,
            total,
            page: pageNumber,
            limit: limitNumber,
            totalPages: Math.ceil(total / limitNumber),
            hasMore: skip + limitNumber < total,
        };
    }
    async findLowStock() {
        // Use raw SQL for complex comparison since Prisma doesn't support column comparisons directly
        return this.prisma.$queryRaw `
      SELECT * FROM "Tire" 
      WHERE quantity <= "minStock" OR quantity <= 0
      ORDER BY quantity ASC
    `;
    }
    async adjustStock(id, adjustment) {
        return this.prisma.$transaction(async (prisma) => {
            const tire = await prisma.tire.findUnique({
                where: { id },
            });
            if (!tire) {
                throw new Error('Tire not found');
            }
            let newQuantity;
            switch (adjustment.type) {
                case 'add':
                    newQuantity = tire.quantity + adjustment.quantity;
                    break;
                case 'remove':
                    newQuantity = Math.max(0, tire.quantity - adjustment.quantity);
                    break;
                case 'set':
                    newQuantity = Math.max(0, adjustment.quantity);
                    break;
                default:
                    throw new Error('Invalid adjustment type');
            }
            return prisma.tire.update({
                where: { id },
                data: { quantity: newQuantity },
            });
        });
    }
    async getInventoryReport(filters) {
        const where = {};
        if (filters?.startDate || filters?.endDate) {
            where.updatedAt = {};
            if (filters.startDate)
                where.updatedAt.gte = filters.startDate;
            if (filters.endDate)
                where.updatedAt.lte = filters.endDate;
        }
        const [tires, lowStockItems, brandAggregation, typeAggregation,] = await Promise.all([
            this.prisma.tire.findMany({ where }),
            this.findLowStock(),
            this.prisma.tire.groupBy({
                by: ['brand'],
                where,
                _sum: {
                    quantity: true,
                },
            }),
            this.prisma.tire.groupBy({
                by: ['type'],
                where,
                _sum: {
                    quantity: true,
                },
            }),
        ]);
        const totalValue = tires.reduce((sum, tire) => sum + tire.price.toNumber() * tire.quantity, 0);
        const totalCost = tires.reduce((sum, tire) => sum + (tire.cost?.toNumber() || 0) * tire.quantity, 0);
        const totalItems = tires.reduce((sum, tire) => sum + tire.quantity, 0);
        const byBrand = brandAggregation.reduce((acc, item) => {
            acc[item.brand] = item._sum.quantity || 0;
            return acc;
        }, {});
        const byType = typeAggregation.reduce((acc, item) => {
            acc[item.type] = item._sum.quantity || 0;
            return acc;
        }, {});
        return {
            totalValue,
            totalCost,
            totalItems,
            lowStockItems,
            byBrand,
            byType,
        };
    }
    async findByBrandAndModel(brand, model) {
        // Model field has been removed, search by brand only
        return this.prisma.tire.findMany({
            where: {
                brand: {
                    equals: brand,
                    mode: 'insensitive',
                },
            },
        });
    }
    async findBySizeAndType(size, type) {
        const where = {
            size: {
                equals: size,
                mode: 'insensitive',
            },
        };
        if (type) {
            where.type = type;
        }
        return this.prisma.tire.findMany({
            where,
            orderBy: [{ brand: 'asc' }, { size: 'asc' }],
        });
    }
    buildWhereClause(filters, search) {
        const where = {};
        if (filters) {
            if (filters.brand) {
                where.brand = {
                    contains: filters.brand,
                    mode: 'insensitive',
                };
            }
            if (filters.size) {
                where.size = {
                    contains: filters.size,
                    mode: 'insensitive',
                };
            }
            if (filters.type) {
                where.type = filters.type;
            }
            if (filters.condition) {
                where.condition = filters.condition;
            }
            if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
                where.price = {};
                if (filters.minPrice !== undefined) {
                    where.price.gte = filters.minPrice;
                }
                if (filters.maxPrice !== undefined) {
                    where.price.lte = filters.maxPrice;
                }
            }
            if (filters.inStock) {
                where.quantity = { gt: 0 };
            }
            if (filters.lowStock) {
                // Note: For proper low stock filtering, we'll need to handle this in the service layer
                // or use a separate method since Prisma doesn't support column comparisons directly
                where.quantity = { lte: 5 }; // Default low stock threshold
            }
        }
        if (search) {
            where.OR = [
                {
                    brand: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
                {
                    size: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
            ];
        }
        return where;
    }
    async getBrands() {
        const result = await this.prisma.tire.findMany({
            select: { brand: true },
            distinct: ['brand'],
            orderBy: { brand: 'asc' },
        });
        return result.map((tire) => tire.brand);
    }
    async getModelsForBrand(brand) {
        // Model field has been removed, return empty array
        return [];
    }
    async getSizes() {
        const result = await this.prisma.tire.findMany({
            select: { size: true },
            distinct: ['size'],
            orderBy: { size: 'asc' },
        });
        return result.map((tire) => tire.size);
    }
};
exports.TireRepository = TireRepository;
exports.TireRepository = TireRepository = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object])
], TireRepository);


/***/ }),
/* 39 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BaseRepository = void 0;
class BaseRepository {
    constructor(prisma, modelName) {
        this.prisma = prisma;
        this.modelName = modelName;
    }
    async findAll(args) {
        return this.prisma[this.modelName].findMany(args);
    }
    async findById(id) {
        return this.prisma[this.modelName].findUnique({
            where: { id },
        });
    }
    async create(data) {
        return this.prisma[this.modelName].create({
            data,
        });
    }
    async update(id, data) {
        return this.prisma[this.modelName].update({
            where: { id },
            data,
        });
    }
    async delete(id) {
        await this.prisma[this.modelName].delete({
            where: { id },
        });
        return true;
    }
}
exports.BaseRepository = BaseRepository;


/***/ }),
/* 40 */
/***/ ((module) => {

module.exports = require("@prisma/client/runtime/library");

/***/ }),
/* 41 */
/***/ ((module) => {

module.exports = require("@gt-automotive/shared-dto");

/***/ }),
/* 42 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CustomersModule = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const customers_service_1 = __webpack_require__(43);
const customers_controller_1 = __webpack_require__(45);
const customer_repository_1 = __webpack_require__(44);
const user_repository_1 = __webpack_require__(13);
const audit_repository_1 = __webpack_require__(19);
const database_1 = __webpack_require__(14);
let CustomersModule = class CustomersModule {
};
exports.CustomersModule = CustomersModule;
exports.CustomersModule = CustomersModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [database_1.DatabaseModule],
        controllers: [customers_controller_1.CustomersController],
        providers: [
            customers_service_1.CustomersService,
            customer_repository_1.CustomerRepository,
            user_repository_1.UserRepository,
            audit_repository_1.AuditRepository,
        ],
        exports: [customers_service_1.CustomersService, customer_repository_1.CustomerRepository],
    })
], CustomersModule);


/***/ }),
/* 43 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CustomersService = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const customer_repository_1 = __webpack_require__(44);
const audit_repository_1 = __webpack_require__(19);
const database_1 = __webpack_require__(14);
let CustomersService = class CustomersService {
    constructor(customerRepository, auditRepository, prisma) {
        this.customerRepository = customerRepository;
        this.auditRepository = auditRepository;
        this.prisma = prisma;
    }
    async create(createCustomerDto, createdBy) {
        // Check for existing customer with same email if provided
        if (createCustomerDto.email) {
            const existingCustomer = await this.customerRepository.findByEmail(createCustomerDto.email);
            if (existingCustomer) {
                throw new common_1.BadRequestException('A customer with this email already exists');
            }
        }
        // Create customer directly without user account
        const customer = await this.prisma.customer.create({
            data: {
                firstName: createCustomerDto.firstName,
                lastName: createCustomerDto.lastName,
                email: createCustomerDto.email,
                phone: createCustomerDto.phone,
                address: createCustomerDto.address,
                businessName: createCustomerDto.businessName,
            },
        });
        // Log the action
        await this.auditRepository.create({
            userId: createdBy,
            action: 'CREATE_CUSTOMER',
            entityType: 'customer',
            entityId: customer.id,
            details: customer,
        });
        return customer;
    }
    async findAll(userId, userRole) {
        // Only staff and admin can see all customers
        return this.customerRepository.findAllWithDetails();
    }
    async findOne(id, userId, userRole) {
        const customer = await this.customerRepository.findOneWithDetails(id);
        if (!customer) {
            throw new common_1.NotFoundException(`Customer with ID ${id} not found`);
        }
        // Get customer statistics
        const stats = await this.customerRepository.getCustomerStats(id);
        return {
            ...customer,
            stats,
        };
    }
    async update(id, updateCustomerDto, userId, userRole) {
        const customer = await this.customerRepository.findById(id);
        if (!customer) {
            throw new common_1.NotFoundException(`Customer with ID ${id} not found`);
        }
        // Update customer data directly
        const updatedCustomer = await this.prisma.customer.update({
            where: { id },
            data: {
                ...(updateCustomerDto.firstName && { firstName: updateCustomerDto.firstName }),
                ...(updateCustomerDto.lastName && { lastName: updateCustomerDto.lastName }),
                ...(updateCustomerDto.email !== undefined && { email: updateCustomerDto.email }),
                ...(updateCustomerDto.phone !== undefined && { phone: updateCustomerDto.phone }),
                ...(updateCustomerDto.address !== undefined && { address: updateCustomerDto.address }),
                ...(updateCustomerDto.businessName !== undefined && { businessName: updateCustomerDto.businessName }),
            },
            include: {
                vehicles: true,
            },
        });
        // Log the action
        await this.auditRepository.create({
            userId,
            action: 'UPDATE_CUSTOMER',
            entityType: 'customer',
            entityId: id,
            details: { old: customer, new: updatedCustomer },
        });
        return updatedCustomer;
    }
    async remove(id, userId) {
        const customer = await this.customerRepository.findById(id);
        if (!customer) {
            throw new common_1.NotFoundException(`Customer with ID ${id} not found`);
        }
        // Check for existing invoices or appointments
        const hasInvoices = await this.prisma.invoice.count({
            where: { customerId: id },
        });
        const hasAppointments = await this.prisma.appointment.count({
            where: { customerId: id },
        });
        if (hasInvoices > 0 || hasAppointments > 0) {
            throw new common_1.BadRequestException('Cannot delete customer with existing invoices or appointments.');
        }
        // Delete customer (vehicles will be cascade deleted)
        await this.prisma.customer.delete({
            where: { id },
        });
        // Log the action
        await this.auditRepository.create({
            userId,
            action: 'DELETE_CUSTOMER',
            entityType: 'customer',
            entityId: id,
            details: customer,
        });
        return { message: 'Customer deleted successfully' };
    }
    async search(searchTerm, userId, userRole) {
        return this.customerRepository.search(searchTerm);
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof customer_repository_1.CustomerRepository !== "undefined" && customer_repository_1.CustomerRepository) === "function" ? _a : Object, typeof (_b = typeof audit_repository_1.AuditRepository !== "undefined" && audit_repository_1.AuditRepository) === "function" ? _b : Object, typeof (_c = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _c : Object])
], CustomersService);


/***/ }),
/* 44 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CustomerRepository = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const database_1 = __webpack_require__(14);
const base_repository_1 = __webpack_require__(39);
let CustomerRepository = class CustomerRepository extends base_repository_1.BaseRepository {
    constructor(prisma) {
        super(prisma, 'customer');
    }
    async findByEmail(email) {
        return this.prisma.customer.findFirst({
            where: { email },
            include: {
                vehicles: true,
                _count: {
                    select: {
                        invoices: true,
                        appointments: true,
                    },
                },
            },
        });
    }
    async findAllWithDetails() {
        return this.prisma.customer.findMany({
            include: {
                vehicles: true,
                _count: {
                    select: {
                        invoices: true,
                        appointments: true,
                        vehicles: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findOneWithDetails(id) {
        return this.prisma.customer.findUnique({
            where: { id },
            include: {
                vehicles: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
                invoices: {
                    take: 10,
                    orderBy: {
                        createdAt: 'desc',
                    },
                    include: {
                        vehicle: true,
                        items: true,
                    },
                },
                appointments: {
                    take: 10,
                    orderBy: {
                        scheduledDate: 'desc',
                    },
                    include: {
                        vehicle: true,
                    },
                },
            },
        });
    }
    async search(searchTerm) {
        return this.prisma.customer.findMany({
            where: {
                OR: [
                    { firstName: { contains: searchTerm, mode: 'insensitive' } },
                    { lastName: { contains: searchTerm, mode: 'insensitive' } },
                    { email: { contains: searchTerm, mode: 'insensitive' } },
                    { phone: { contains: searchTerm, mode: 'insensitive' } },
                    { address: { contains: searchTerm, mode: 'insensitive' } },
                    { businessName: { contains: searchTerm, mode: 'insensitive' } },
                ],
            },
            include: {
                vehicles: true,
                _count: {
                    select: {
                        invoices: true,
                        appointments: true,
                        vehicles: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async getCustomerStats(customerId) {
        const [totalSpent, vehicleCount, appointmentCount, lastVisit] = await Promise.all([
            // Total amount spent
            this.prisma.invoice.aggregate({
                where: {
                    customerId,
                    status: 'PAID',
                },
                _sum: {
                    total: true,
                },
            }),
            // Number of vehicles
            this.prisma.vehicle.count({
                where: { customerId },
            }),
            // Number of appointments
            this.prisma.appointment.count({
                where: { customerId },
            }),
            // Last visit date
            this.prisma.invoice.findFirst({
                where: { customerId },
                orderBy: { createdAt: 'desc' },
                select: { createdAt: true },
            }),
        ]);
        return {
            totalSpent: totalSpent._sum.total || 0,
            vehicleCount,
            appointmentCount,
            lastVisitDate: lastVisit?.createdAt || null,
        };
    }
    async findById(id) {
        return this.prisma.customer.findUnique({
            where: { id },
        });
    }
};
exports.CustomerRepository = CustomerRepository;
exports.CustomerRepository = CustomerRepository = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object])
], CustomerRepository);


/***/ }),
/* 45 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CustomersController = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const customers_service_1 = __webpack_require__(43);
const shared_dto_1 = __webpack_require__(41);
const shared_dto_2 = __webpack_require__(41);
const jwt_auth_guard_1 = __webpack_require__(23);
const role_guard_1 = __webpack_require__(28);
const roles_decorator_1 = __webpack_require__(29);
const current_user_decorator_1 = __webpack_require__(22);
let CustomersController = class CustomersController {
    constructor(customersService) {
        this.customersService = customersService;
    }
    create(createCustomerDto, user) {
        return this.customersService.create(createCustomerDto, user.id);
    }
    findAll(user) {
        return this.customersService.findAll(user.id, user.role.name);
    }
    search(searchTerm, user) {
        return this.customersService.search(searchTerm, user.id, user.role.name);
    }
    findOne(id, user) {
        return this.customersService.findOne(id, user.id, user.role.name);
    }
    update(id, updateCustomerDto, user) {
        return this.customersService.update(id, updateCustomerDto, user.id, user.role.name);
    }
    remove(id, user) {
        return this.customersService.remove(id, user.id);
    }
};
exports.CustomersController = CustomersController;
tslib_1.__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(role_guard_1.RoleGuard),
    (0, roles_decorator_1.Roles)('STAFF', 'ADMIN'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__param(1, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_b = typeof shared_dto_1.CreateCustomerDto !== "undefined" && shared_dto_1.CreateCustomerDto) === "function" ? _b : Object, Object]),
    tslib_1.__metadata("design:returntype", void 0)
], CustomersController.prototype, "create", null);
tslib_1.__decorate([
    (0, common_1.Get)(),
    tslib_1.__param(0, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", void 0)
], CustomersController.prototype, "findAll", null);
tslib_1.__decorate([
    (0, common_1.Get)('search'),
    (0, common_1.UseGuards)(role_guard_1.RoleGuard),
    (0, roles_decorator_1.Roles)('STAFF', 'ADMIN'),
    tslib_1.__param(0, (0, common_1.Query)('q')),
    tslib_1.__param(1, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", void 0)
], CustomersController.prototype, "search", null);
tslib_1.__decorate([
    (0, common_1.Get)(':id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", void 0)
], CustomersController.prototype, "findOne", null);
tslib_1.__decorate([
    (0, common_1.Patch)(':id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__param(2, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, typeof (_c = typeof shared_dto_2.UpdateCustomerDto !== "undefined" && shared_dto_2.UpdateCustomerDto) === "function" ? _c : Object, Object]),
    tslib_1.__metadata("design:returntype", void 0)
], CustomersController.prototype, "update", null);
tslib_1.__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(role_guard_1.RoleGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", void 0)
], CustomersController.prototype, "remove", null);
exports.CustomersController = CustomersController = tslib_1.__decorate([
    (0, common_1.Controller)('api/customers'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof customers_service_1.CustomersService !== "undefined" && customers_service_1.CustomersService) === "function" ? _a : Object])
], CustomersController);


/***/ }),
/* 46 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VehiclesModule = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const vehicles_service_1 = __webpack_require__(47);
const vehicles_controller_1 = __webpack_require__(49);
const vehicle_repository_1 = __webpack_require__(48);
const customer_repository_1 = __webpack_require__(44);
const audit_repository_1 = __webpack_require__(19);
const database_1 = __webpack_require__(14);
let VehiclesModule = class VehiclesModule {
};
exports.VehiclesModule = VehiclesModule;
exports.VehiclesModule = VehiclesModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [database_1.DatabaseModule],
        controllers: [vehicles_controller_1.VehiclesController],
        providers: [
            vehicles_service_1.VehiclesService,
            vehicle_repository_1.VehicleRepository,
            customer_repository_1.CustomerRepository,
            audit_repository_1.AuditRepository,
        ],
        exports: [vehicles_service_1.VehiclesService, vehicle_repository_1.VehicleRepository],
    })
], VehiclesModule);


/***/ }),
/* 47 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VehiclesService = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const vehicle_repository_1 = __webpack_require__(48);
const customer_repository_1 = __webpack_require__(44);
const audit_repository_1 = __webpack_require__(19);
const database_1 = __webpack_require__(14);
let VehiclesService = class VehiclesService {
    constructor(vehicleRepository, customerRepository, auditRepository, prisma) {
        this.vehicleRepository = vehicleRepository;
        this.customerRepository = customerRepository;
        this.auditRepository = auditRepository;
        this.prisma = prisma;
    }
    async create(createVehicleDto, userId, userRole) {
        // Verify customer exists
        const customer = await this.customerRepository.findById(createVehicleDto.customerId);
        if (!customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        // Customer role validation would require proper customer-user mapping
        // For now, only staff and admin can create vehicles
        if (userRole === 'CUSTOMER') {
            throw new common_1.ForbiddenException('Customer vehicle creation needs proper customer context implementation');
        }
        // Check for duplicate VIN if provided
        if (createVehicleDto.vin) {
            const existingVehicle = await this.vehicleRepository.findByVin(createVehicleDto.vin);
            if (existingVehicle) {
                throw new common_1.BadRequestException('A vehicle with this VIN already exists');
            }
        }
        const vehicle = await this.vehicleRepository.create({
            customer: { connect: { id: createVehicleDto.customerId } },
            make: createVehicleDto.make,
            model: createVehicleDto.model,
            year: createVehicleDto.year,
            vin: createVehicleDto.vin,
            licensePlate: createVehicleDto.licensePlate,
            mileage: createVehicleDto.mileage,
        });
        // Log the action
        await this.auditRepository.create({
            userId,
            action: 'CREATE_VEHICLE',
            entityType: 'vehicle',
            entityId: vehicle.id,
            newValue: vehicle,
        });
        return this.vehicleRepository.findOneWithDetails(vehicle.id);
    }
    async findAll(userId, userRole) {
        // Customer role access requires proper customer-user context mapping
        if (userRole === 'CUSTOMER') {
            throw new common_1.ForbiddenException('Customer vehicle access needs proper customer context implementation');
        }
        // Staff and admin can see all vehicles
        return this.vehicleRepository.findAllWithDetails();
    }
    async findByCustomer(customerId, userId, userRole) {
        const customer = await this.customerRepository.findById(customerId);
        if (!customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        // Customer role validation requires proper customer context
        if (userRole === 'CUSTOMER') {
            throw new common_1.ForbiddenException('Customer vehicle access needs proper customer context implementation');
        }
        return this.vehicleRepository.findByCustomer(customerId);
    }
    async findOne(id, userId, userRole) {
        const vehicle = await this.vehicleRepository.findOneWithDetails(id);
        if (!vehicle) {
            throw new common_1.NotFoundException(`Vehicle with ID ${id} not found`);
        }
        // Customer role validation requires proper customer context
        if (userRole === 'CUSTOMER') {
            throw new common_1.ForbiddenException('Customer vehicle access needs proper customer context implementation');
        }
        // Get vehicle statistics
        const stats = await this.vehicleRepository.getVehicleStats(id);
        return {
            ...vehicle,
            stats,
        };
    }
    async update(id, updateVehicleDto, userId, userRole) {
        const vehicle = await this.vehicleRepository.findById(id);
        if (!vehicle) {
            throw new common_1.NotFoundException(`Vehicle with ID ${id} not found`);
        }
        // Customer role validation requires proper customer context
        if (userRole === 'CUSTOMER') {
            throw new common_1.ForbiddenException('Customer vehicle updates need proper customer context implementation');
        }
        // Check for duplicate VIN if updating
        if (updateVehicleDto.vin && updateVehicleDto.vin !== vehicle.vin) {
            const existingVehicle = await this.vehicleRepository.findByVin(updateVehicleDto.vin);
            if (existingVehicle) {
                throw new common_1.BadRequestException('A vehicle with this VIN already exists');
            }
        }
        const updatedVehicle = await this.vehicleRepository.update(id, {
            ...(updateVehicleDto.make && { make: updateVehicleDto.make }),
            ...(updateVehicleDto.model && { model: updateVehicleDto.model }),
            ...(updateVehicleDto.year && { year: updateVehicleDto.year }),
            ...(updateVehicleDto.vin !== undefined && { vin: updateVehicleDto.vin }),
            ...(updateVehicleDto.licensePlate !== undefined && { licensePlate: updateVehicleDto.licensePlate }),
            ...(updateVehicleDto.mileage !== undefined && { mileage: updateVehicleDto.mileage }),
        });
        // Log the action if not a self-update
        if (userRole !== 'CUSTOMER') {
            await this.auditRepository.create({
                userId,
                action: 'UPDATE_VEHICLE',
                entityType: 'vehicle',
                resourceId: id,
                oldValue: vehicle,
                newValue: updatedVehicle,
            });
        }
        return this.vehicleRepository.findOneWithDetails(id);
    }
    async remove(id, userId, userRole) {
        const vehicle = await this.vehicleRepository.findById(id);
        if (!vehicle) {
            throw new common_1.NotFoundException(`Vehicle with ID ${id} not found`);
        }
        // Customer role validation requires proper customer context
        if (userRole === 'CUSTOMER') {
            throw new common_1.ForbiddenException('Customer vehicle deletion needs proper customer context implementation');
        }
        else if (userRole !== 'ADMIN') {
            throw new common_1.ForbiddenException('Only administrators can delete vehicles');
        }
        // Check for existing invoices or appointments
        const hasInvoices = await this.prisma.invoice.count({
            where: { vehicleId: id },
        });
        const hasAppointments = await this.prisma.appointment.count({
            where: { vehicleId: id },
        });
        if (hasInvoices > 0 || hasAppointments > 0) {
            throw new common_1.BadRequestException('Cannot delete vehicle with existing service history. Please contact an administrator.');
        }
        await this.vehicleRepository.delete(id);
        // Log the action
        await this.auditRepository.create({
            userId,
            action: 'DELETE_VEHICLE',
            entityType: 'vehicle',
            entityId: id,
            oldValue: vehicle,
        });
        return { message: 'Vehicle deleted successfully' };
    }
    async search(searchTerm, userId, userRole) {
        const vehicles = await this.vehicleRepository.search(searchTerm);
        // Filter results for customers
        if (userRole === 'CUSTOMER') {
            throw new common_1.ForbiddenException('Customer vehicle search needs proper customer context implementation');
        }
        return vehicles;
    }
    async updateMileage(id, mileage, userId, userRole) {
        const vehicle = await this.vehicleRepository.findById(id);
        if (!vehicle) {
            throw new common_1.NotFoundException(`Vehicle with ID ${id} not found`);
        }
        // Validate mileage (cannot decrease)
        if (vehicle.mileage && mileage < vehicle.mileage) {
            throw new common_1.BadRequestException('Mileage cannot be decreased');
        }
        // Customer role validation requires proper customer context
        if (userRole === 'CUSTOMER') {
            throw new common_1.ForbiddenException('Customer vehicle updates need proper customer context implementation');
        }
        const updatedVehicle = await this.vehicleRepository.update(id, { mileage });
        // Log the action
        await this.auditRepository.create({
            userId,
            action: 'UPDATE_VEHICLE_MILEAGE',
            entityType: 'vehicle',
            entityId: id,
            oldValue: { mileage: vehicle.mileage },
            newValue: { mileage },
        });
        return updatedVehicle;
    }
};
exports.VehiclesService = VehiclesService;
exports.VehiclesService = VehiclesService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof vehicle_repository_1.VehicleRepository !== "undefined" && vehicle_repository_1.VehicleRepository) === "function" ? _a : Object, typeof (_b = typeof customer_repository_1.CustomerRepository !== "undefined" && customer_repository_1.CustomerRepository) === "function" ? _b : Object, typeof (_c = typeof audit_repository_1.AuditRepository !== "undefined" && audit_repository_1.AuditRepository) === "function" ? _c : Object, typeof (_d = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _d : Object])
], VehiclesService);


/***/ }),
/* 48 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VehicleRepository = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const database_1 = __webpack_require__(14);
const base_repository_1 = __webpack_require__(39);
let VehicleRepository = class VehicleRepository extends base_repository_1.BaseRepository {
    constructor(prisma) {
        super(prisma, 'vehicle');
    }
    async findAllWithDetails() {
        return this.prisma.vehicle.findMany({
            include: {
                customer: true,
                _count: {
                    select: {
                        invoices: true,
                        appointments: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findByCustomer(customerId) {
        return this.prisma.vehicle.findMany({
            where: { customerId },
            include: {
                _count: {
                    select: {
                        invoices: true,
                        appointments: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findOneWithDetails(id) {
        return this.prisma.vehicle.findUnique({
            where: { id },
            include: {
                customer: true,
                invoices: {
                    take: 10,
                    orderBy: {
                        createdAt: 'desc',
                    },
                    include: {
                        items: true,
                    },
                },
                appointments: {
                    take: 10,
                    orderBy: {
                        scheduledDate: 'desc',
                    },
                },
            },
        });
    }
    async findByVin(vin) {
        return this.prisma.vehicle.findUnique({
            where: { vin },
            include: {
                customer: true,
            },
        });
    }
    async search(searchTerm) {
        return this.prisma.vehicle.findMany({
            where: {
                OR: [
                    { make: { contains: searchTerm, mode: 'insensitive' } },
                    { model: { contains: searchTerm, mode: 'insensitive' } },
                    { vin: { contains: searchTerm, mode: 'insensitive' } },
                    { licensePlate: { contains: searchTerm, mode: 'insensitive' } },
                ],
            },
            include: {
                customer: true,
                _count: {
                    select: {
                        invoices: true,
                        appointments: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async getVehicleStats(vehicleId) {
        const [serviceCount, totalSpent, lastService, nextAppointment] = await Promise.all([
            // Number of services
            this.prisma.invoice.count({
                where: { vehicleId },
            }),
            // Total amount spent on this vehicle
            this.prisma.invoice.aggregate({
                where: {
                    vehicleId,
                    status: 'PAID',
                },
                _sum: {
                    total: true,
                },
            }),
            // Last service date
            this.prisma.invoice.findFirst({
                where: { vehicleId },
                orderBy: { createdAt: 'desc' },
                select: { createdAt: true },
            }),
            // Next scheduled appointment
            this.prisma.appointment.findFirst({
                where: {
                    vehicleId,
                    status: { in: ['SCHEDULED', 'CONFIRMED'] },
                    scheduledDate: { gte: new Date() },
                },
                orderBy: { scheduledDate: 'asc' },
                select: {
                    scheduledDate: true,
                    scheduledTime: true,
                    serviceType: true,
                },
            }),
        ]);
        return {
            serviceCount,
            totalSpent: totalSpent._sum.total || 0,
            lastServiceDate: lastService?.createdAt || null,
            nextAppointment,
        };
    }
};
exports.VehicleRepository = VehicleRepository;
exports.VehicleRepository = VehicleRepository = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object])
], VehicleRepository);


/***/ }),
/* 49 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VehiclesController = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const vehicles_service_1 = __webpack_require__(47);
const shared_dto_1 = __webpack_require__(41);
const shared_dto_2 = __webpack_require__(41);
const jwt_auth_guard_1 = __webpack_require__(23);
// import { RoleGuard } from '../auth/guards/role.guard';
// import { Roles } from '../auth/decorators/roles.decorator';
const current_user_decorator_1 = __webpack_require__(22);
let VehiclesController = class VehiclesController {
    constructor(vehiclesService) {
        this.vehiclesService = vehiclesService;
    }
    create(createVehicleDto, user) {
        return this.vehiclesService.create(createVehicleDto, user.id, user.role.name);
    }
    findAll(user) {
        return this.vehiclesService.findAll(user.id, user.role.name);
    }
    search(searchTerm, user) {
        return this.vehiclesService.search(searchTerm, user.id, user.role.name);
    }
    findByCustomer(customerId, user) {
        return this.vehiclesService.findByCustomer(customerId, user.id, user.role.name);
    }
    findOne(id, user) {
        return this.vehiclesService.findOne(id, user.id, user.role.name);
    }
    update(id, updateVehicleDto, user) {
        return this.vehiclesService.update(id, updateVehicleDto, user.id, user.role.name);
    }
    updateMileage(id, mileage, user) {
        return this.vehiclesService.updateMileage(id, mileage, user.id, user.role.name);
    }
    remove(id, user) {
        return this.vehiclesService.remove(id, user.id, user.role.name);
    }
};
exports.VehiclesController = VehiclesController;
tslib_1.__decorate([
    (0, common_1.Post)(),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__param(1, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_b = typeof shared_dto_1.CreateVehicleDto !== "undefined" && shared_dto_1.CreateVehicleDto) === "function" ? _b : Object, Object]),
    tslib_1.__metadata("design:returntype", void 0)
], VehiclesController.prototype, "create", null);
tslib_1.__decorate([
    (0, common_1.Get)(),
    tslib_1.__param(0, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", void 0)
], VehiclesController.prototype, "findAll", null);
tslib_1.__decorate([
    (0, common_1.Get)('search'),
    tslib_1.__param(0, (0, common_1.Query)('q')),
    tslib_1.__param(1, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", void 0)
], VehiclesController.prototype, "search", null);
tslib_1.__decorate([
    (0, common_1.Get)('customer/:customerId'),
    tslib_1.__param(0, (0, common_1.Param)('customerId')),
    tslib_1.__param(1, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", void 0)
], VehiclesController.prototype, "findByCustomer", null);
tslib_1.__decorate([
    (0, common_1.Get)(':id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", void 0)
], VehiclesController.prototype, "findOne", null);
tslib_1.__decorate([
    (0, common_1.Patch)(':id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__param(2, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, typeof (_c = typeof shared_dto_2.UpdateVehicleDto !== "undefined" && shared_dto_2.UpdateVehicleDto) === "function" ? _c : Object, Object]),
    tslib_1.__metadata("design:returntype", void 0)
], VehiclesController.prototype, "update", null);
tslib_1.__decorate([
    (0, common_1.Patch)(':id/mileage'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)('mileage')),
    tslib_1.__param(2, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Number, Object]),
    tslib_1.__metadata("design:returntype", void 0)
], VehiclesController.prototype, "updateMileage", null);
tslib_1.__decorate([
    (0, common_1.Delete)(':id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", void 0)
], VehiclesController.prototype, "remove", null);
exports.VehiclesController = VehiclesController = tslib_1.__decorate([
    (0, common_1.Controller)('api/vehicles'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof vehicles_service_1.VehiclesService !== "undefined" && vehicles_service_1.VehiclesService) === "function" ? _a : Object])
], VehiclesController);


/***/ }),
/* 50 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InvoicesModule = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const invoices_service_1 = __webpack_require__(51);
const invoices_controller_1 = __webpack_require__(53);
const invoice_repository_1 = __webpack_require__(52);
const audit_repository_1 = __webpack_require__(19);
const customer_repository_1 = __webpack_require__(44);
const database_1 = __webpack_require__(14);
let InvoicesModule = class InvoicesModule {
};
exports.InvoicesModule = InvoicesModule;
exports.InvoicesModule = InvoicesModule = tslib_1.__decorate([
    (0, common_1.Module)({
        controllers: [invoices_controller_1.InvoicesController],
        providers: [
            invoices_service_1.InvoicesService,
            invoice_repository_1.InvoiceRepository,
            audit_repository_1.AuditRepository,
            customer_repository_1.CustomerRepository,
            database_1.PrismaService,
        ],
        exports: [invoices_service_1.InvoicesService],
    })
], InvoicesModule);


/***/ }),
/* 51 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InvoicesService = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const invoice_repository_1 = __webpack_require__(52);
const audit_repository_1 = __webpack_require__(19);
const customer_repository_1 = __webpack_require__(44);
let InvoicesService = class InvoicesService {
    constructor(invoiceRepository, auditRepository, customerRepository) {
        this.invoiceRepository = invoiceRepository;
        this.auditRepository = auditRepository;
        this.customerRepository = customerRepository;
    }
    async create(createInvoiceDto, userId) {
        console.log('Creating invoice with data:', JSON.stringify(createInvoiceDto, null, 2));
        let customerId = createInvoiceDto.customerId;
        // Create customer ONLY if customerData is provided AND no customerId exists
        // This prevents creating duplicate customers when an existing customer is selected
        if (!customerId && createInvoiceDto.customerData) {
            const { firstName, lastName, businessName, address, phone, email } = createInvoiceDto.customerData;
            try {
                console.log('Creating customer with firstName:', firstName, 'lastName:', lastName);
                // Create customer directly without user relationship
                const customerData = {
                    firstName,
                    lastName,
                    email: email || '', // Empty string instead of generated email
                    phone: phone || null,
                    address: address || null,
                    businessName: businessName || null,
                };
                console.log('Customer data to create:', JSON.stringify(customerData, null, 2));
                const newCustomer = await this.customerRepository.create(customerData);
                customerId = newCustomer.id;
                console.log('Customer created with ID:', customerId);
            }
            catch (error) {
                console.error('Error creating customer:', error);
                throw new common_1.BadRequestException(`Failed to create customer: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
        // Validate that we have a customerId
        if (!customerId) {
            throw new common_1.BadRequestException('Either customerId or customerData must be provided');
        }
        // Calculate totals
        let subtotal = 0;
        const items = createInvoiceDto.items.map(item => {
            const total = item.quantity * item.unitPrice;
            subtotal += total;
            return {
                ...item,
                itemType: item.itemType,
                total,
            };
        });
        // Handle tax calculations - support both combined and separate rates
        let taxRate;
        let gstRate;
        let pstRate;
        let gstAmount;
        let pstAmount;
        if (createInvoiceDto.gstRate !== undefined || createInvoiceDto.pstRate !== undefined) {
            // Use separate GST/PST rates
            gstRate = createInvoiceDto.gstRate ?? 0;
            pstRate = createInvoiceDto.pstRate ?? 0;
            gstAmount = subtotal * gstRate;
            pstAmount = subtotal * pstRate;
            taxRate = gstRate + pstRate;
        }
        else {
            // Use combined tax rate (backward compatibility)
            taxRate = createInvoiceDto.taxRate ?? 0.0825;
        }
        const taxAmount = subtotal * taxRate;
        const total = subtotal + taxAmount;
        console.log('Calculated tax values:', {
            gstRate,
            pstRate,
            gstAmount,
            pstAmount,
            taxRate,
            taxAmount
        });
        // Generate invoice number
        const invoiceNumber = await this.invoiceRepository.generateInvoiceNumber();
        // Create invoice with items
        const invoice = await this.invoiceRepository.createWithItems({
            invoiceNumber,
            customer: { connect: { id: customerId } },
            vehicle: createInvoiceDto.vehicleId ? { connect: { id: createInvoiceDto.vehicleId } } : undefined,
            subtotal,
            taxRate,
            taxAmount,
            ...(gstRate !== undefined && { gstRate }),
            ...(gstAmount !== undefined && { gstAmount }),
            ...(pstRate !== undefined && { pstRate }),
            ...(pstAmount !== undefined && { pstAmount }),
            total,
            status: createInvoiceDto.paymentMethod ? 'PAID' : 'PENDING',
            paymentMethod: createInvoiceDto.paymentMethod,
            notes: createInvoiceDto.notes,
            createdBy: userId,
            paidAt: createInvoiceDto.paymentMethod ? new Date() : undefined,
        }, items);
        // Log the creation
        await this.auditRepository.create({
            userId,
            action: 'CREATE_INVOICE',
            entityType: 'invoice',
            entityId: invoice.id,
            details: invoice,
        });
        return invoice;
    }
    async findAll(user) {
        // If customer, only show their invoices
        if (user.role === 'CUSTOMER') {
            const customerId = user.customerId;
            if (!customerId) {
                return [];
            }
            return this.invoiceRepository.findByCustomer(customerId, true);
        }
        // Staff and Admin can see all invoices
        return this.invoiceRepository.findAll({
            include: {
                customer: true,
                vehicle: true,
                items: {
                    include: {
                        tire: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id, user) {
        const invoice = await this.invoiceRepository.findWithDetails(id);
        if (!invoice) {
            throw new common_1.NotFoundException(`Invoice with ID ${id} not found`);
        }
        // Check if customer can access this invoice
        if (user.role === 'CUSTOMER' && invoice.customerId !== user.customerId) {
            throw new common_1.ForbiddenException('You can only view your own invoices');
        }
        return invoice;
    }
    async update(id, updateInvoiceDto, userId) {
        const invoice = await this.invoiceRepository.findById(id);
        if (!invoice) {
            throw new common_1.NotFoundException(`Invoice with ID ${id} not found`);
        }
        // Cannot update paid or cancelled invoices
        if (invoice.status === 'PAID' || invoice.status === 'CANCELLED') {
            throw new common_1.BadRequestException(`Cannot update invoice with status ${invoice.status}`);
        }
        const oldValue = { ...invoice };
        const updated = await this.invoiceRepository.updateStatus(id, updateInvoiceDto.status || invoice.status, updateInvoiceDto.paidAt ? new Date(updateInvoiceDto.paidAt) : undefined);
        // Log the update
        await this.auditRepository.create({
            userId,
            action: 'UPDATE_INVOICE',
            entityType: 'invoice',
            entityId: id,
            oldValue: oldValue,
            newValue: updated,
        });
        return updated;
    }
    async remove(id, userId) {
        const invoice = await this.invoiceRepository.findById(id);
        if (!invoice) {
            throw new common_1.NotFoundException(`Invoice with ID ${id} not found`);
        }
        // Only allow cancellation, not deletion
        if (invoice.status === 'PAID') {
            throw new common_1.BadRequestException('Cannot cancel a paid invoice');
        }
        await this.invoiceRepository.updateStatus(id, 'CANCELLED');
        // Log the cancellation
        await this.auditRepository.create({
            userId,
            action: 'CANCEL_INVOICE',
            entityType: 'invoice',
            entityId: id,
            oldValue: invoice,
        });
    }
    async searchInvoices(searchParams, user) {
        const params = { ...searchParams };
        if (searchParams.startDate) {
            params.startDate = new Date(searchParams.startDate);
        }
        if (searchParams.endDate) {
            params.endDate = new Date(searchParams.endDate);
        }
        const invoices = await this.invoiceRepository.searchInvoices(params);
        // Filter for customers
        if (user.role === 'CUSTOMER') {
            return invoices.filter(inv => inv.customerId === user.customerId);
        }
        return invoices;
    }
    async getDailyCashReport(date, user) {
        // Only staff and admin can view cash reports
        if (user.role === 'CUSTOMER') {
            throw new common_1.ForbiddenException('You do not have permission to view cash reports');
        }
        const reportDate = new Date(date);
        return this.invoiceRepository.getDailyCashReport(reportDate);
    }
    async getCustomerInvoices(customerId, user) {
        // Customers can only see their own invoices
        if (user.role === 'CUSTOMER' && user.customerId !== customerId) {
            throw new common_1.ForbiddenException('You can only view your own invoices');
        }
        return this.invoiceRepository.findByCustomer(customerId, true);
    }
    async markAsPaid(id, paymentMethod, userId) {
        const invoice = await this.invoiceRepository.findById(id);
        if (!invoice) {
            throw new common_1.NotFoundException(`Invoice with ID ${id} not found`);
        }
        if (invoice.status === 'PAID') {
            throw new common_1.BadRequestException('Invoice is already paid');
        }
        const updated = await this.invoiceRepository.update(id, {
            status: 'PAID',
            paymentMethod,
            paidAt: new Date(),
        });
        // Log the payment
        await this.auditRepository.create({
            userId,
            action: 'MARK_INVOICE_PAID',
            entityType: 'invoice',
            entityId: id,
            newValue: { paymentMethod, paidAt: new Date() },
        });
        return updated;
    }
};
exports.InvoicesService = InvoicesService;
exports.InvoicesService = InvoicesService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof invoice_repository_1.InvoiceRepository !== "undefined" && invoice_repository_1.InvoiceRepository) === "function" ? _a : Object, typeof (_b = typeof audit_repository_1.AuditRepository !== "undefined" && audit_repository_1.AuditRepository) === "function" ? _b : Object, typeof (_c = typeof customer_repository_1.CustomerRepository !== "undefined" && customer_repository_1.CustomerRepository) === "function" ? _c : Object])
], InvoicesService);


/***/ }),
/* 52 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InvoiceRepository = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const base_repository_1 = __webpack_require__(39);
const database_1 = __webpack_require__(14);
let InvoiceRepository = class InvoiceRepository extends base_repository_1.BaseRepository {
    constructor(prisma) {
        super(prisma, 'invoice');
    }
    async findByCustomer(customerId, includeItems = false) {
        return this.prisma.invoice.findMany({
            where: { customerId },
            include: {
                customer: true,
                vehicle: true,
                items: includeItems ? {
                    include: {
                        tire: true,
                    },
                } : false,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findByStatus(status) {
        return this.prisma.invoice.findMany({
            where: { status },
            include: {
                customer: true,
                vehicle: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findWithDetails(id) {
        return this.prisma.invoice.findUnique({
            where: { id },
            include: {
                customer: true,
                vehicle: true,
                items: {
                    include: {
                        tire: true,
                    },
                },
            },
        });
    }
    async createWithItems(invoiceData, items) {
        return this.prisma.$transaction(async (tx) => {
            const invoice = await tx.invoice.create({
                data: {
                    ...invoiceData,
                    items: {
                        create: items,
                    },
                },
                include: {
                    customer: true,
                    vehicle: true,
                    items: {
                        include: {
                            tire: true,
                        },
                    },
                },
            });
            // Deduct tire inventory for tire items
            for (const item of items) {
                if (item.itemType === 'TIRE' && item.tireId) {
                    await tx.tire.update({
                        where: { id: item.tireId },
                        data: {
                            quantity: {
                                decrement: item.quantity,
                            },
                        },
                    });
                }
            }
            return invoice;
        });
    }
    async updateStatus(id, status, paidAt) {
        return this.prisma.invoice.update({
            where: { id },
            data: {
                status,
                paidAt: status === 'PAID' ? (paidAt || new Date()) : undefined,
            },
            include: {
                customer: true,
                vehicle: true,
                items: {
                    include: {
                        tire: true,
                    },
                },
            },
        });
    }
    async getDailyCashReport(date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        const invoices = await this.prisma.invoice.findMany({
            where: {
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
                status: 'PAID',
            },
            include: {
                customer: true,
            },
        });
        const byPaymentMethod = await this.prisma.invoice.groupBy({
            by: ['paymentMethod'],
            where: {
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
                status: 'PAID',
            },
            _sum: {
                total: true,
            },
            _count: true,
        });
        return {
            date: date.toISOString().split('T')[0],
            totalInvoices: invoices.length,
            totalRevenue: invoices.reduce((sum, inv) => sum + Number(inv.total), 0),
            byPaymentMethod,
            invoices,
        };
    }
    async searchInvoices(searchParams) {
        const where = {};
        if (searchParams.invoiceNumber) {
            where.invoiceNumber = {
                contains: searchParams.invoiceNumber,
                mode: 'insensitive',
            };
        }
        if (searchParams.status) {
            where.status = searchParams.status;
        }
        if (searchParams.startDate || searchParams.endDate) {
            where.createdAt = {};
            if (searchParams.startDate) {
                where.createdAt.gte = searchParams.startDate;
            }
            if (searchParams.endDate) {
                where.createdAt.lte = searchParams.endDate;
            }
        }
        if (searchParams.customerName) {
            where.customer = {
                OR: [
                    {
                        firstName: {
                            contains: searchParams.customerName,
                            mode: 'insensitive',
                        },
                    },
                    {
                        lastName: {
                            contains: searchParams.customerName,
                            mode: 'insensitive',
                        },
                    },
                ],
            };
        }
        return this.prisma.invoice.findMany({
            where,
            include: {
                customer: true,
                vehicle: true,
                items: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async generateInvoiceNumber() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const lastInvoice = await this.prisma.invoice.findFirst({
            where: {
                invoiceNumber: {
                    startsWith: `INV-${year}${month}`,
                },
            },
            orderBy: {
                invoiceNumber: 'desc',
            },
        });
        let sequence = 1;
        if (lastInvoice) {
            const lastSequence = parseInt(lastInvoice.invoiceNumber.split('-').pop() || '0');
            sequence = lastSequence + 1;
        }
        return `INV-${year}${month}-${String(sequence).padStart(4, '0')}`;
    }
};
exports.InvoiceRepository = InvoiceRepository;
exports.InvoiceRepository = InvoiceRepository = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object])
], InvoiceRepository);


/***/ }),
/* 53 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InvoicesController = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const invoices_service_1 = __webpack_require__(51);
const shared_dto_1 = __webpack_require__(41);
const shared_dto_2 = __webpack_require__(41);
const jwt_auth_guard_1 = __webpack_require__(23);
const role_guard_1 = __webpack_require__(28);
const roles_decorator_1 = __webpack_require__(29);
const current_user_decorator_1 = __webpack_require__(22);
const client_1 = __webpack_require__(17);
let InvoicesController = class InvoicesController {
    constructor(invoicesService) {
        this.invoicesService = invoicesService;
    }
    create(createInvoiceDto, user) {
        return this.invoicesService.create(createInvoiceDto, user.id);
    }
    findAll(user) {
        return this.invoicesService.findAll(user);
    }
    search(customerName, invoiceNumber, startDate, endDate, status, user) {
        return this.invoicesService.searchInvoices({
            customerName,
            invoiceNumber,
            startDate,
            endDate,
            status,
        }, user);
    }
    getDailyCashReport(date, user) {
        const reportDate = date || new Date().toISOString().split('T')[0];
        return this.invoicesService.getDailyCashReport(reportDate, user);
    }
    getCustomerInvoices(customerId, user) {
        return this.invoicesService.getCustomerInvoices(customerId, user);
    }
    findOne(id, user) {
        return this.invoicesService.findOne(id, user);
    }
    update(id, updateInvoiceDto, user) {
        return this.invoicesService.update(id, updateInvoiceDto, user.id);
    }
    markAsPaid(id, paymentMethod, user) {
        return this.invoicesService.markAsPaid(id, paymentMethod, user.id);
    }
    remove(id, user) {
        return this.invoicesService.remove(id, user.id);
    }
};
exports.InvoicesController = InvoicesController;
tslib_1.__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(role_guard_1.RoleGuard),
    (0, roles_decorator_1.Roles)('STAFF', 'ADMIN'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__param(1, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_b = typeof shared_dto_1.CreateInvoiceDto !== "undefined" && shared_dto_1.CreateInvoiceDto) === "function" ? _b : Object, Object]),
    tslib_1.__metadata("design:returntype", void 0)
], InvoicesController.prototype, "create", null);
tslib_1.__decorate([
    (0, common_1.Get)(),
    tslib_1.__param(0, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", void 0)
], InvoicesController.prototype, "findAll", null);
tslib_1.__decorate([
    (0, common_1.Get)('search'),
    tslib_1.__param(0, (0, common_1.Query)('customerName')),
    tslib_1.__param(1, (0, common_1.Query)('invoiceNumber')),
    tslib_1.__param(2, (0, common_1.Query)('startDate')),
    tslib_1.__param(3, (0, common_1.Query)('endDate')),
    tslib_1.__param(4, (0, common_1.Query)('status')),
    tslib_1.__param(5, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, String, String, typeof (_c = typeof client_1.InvoiceStatus !== "undefined" && client_1.InvoiceStatus) === "function" ? _c : Object, Object]),
    tslib_1.__metadata("design:returntype", void 0)
], InvoicesController.prototype, "search", null);
tslib_1.__decorate([
    (0, common_1.Get)('cash-report'),
    (0, common_1.UseGuards)(role_guard_1.RoleGuard),
    (0, roles_decorator_1.Roles)('STAFF', 'ADMIN'),
    tslib_1.__param(0, (0, common_1.Query)('date')),
    tslib_1.__param(1, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", void 0)
], InvoicesController.prototype, "getDailyCashReport", null);
tslib_1.__decorate([
    (0, common_1.Get)('customer/:customerId'),
    tslib_1.__param(0, (0, common_1.Param)('customerId')),
    tslib_1.__param(1, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", void 0)
], InvoicesController.prototype, "getCustomerInvoices", null);
tslib_1.__decorate([
    (0, common_1.Get)(':id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", void 0)
], InvoicesController.prototype, "findOne", null);
tslib_1.__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(role_guard_1.RoleGuard),
    (0, roles_decorator_1.Roles)('STAFF', 'ADMIN'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__param(2, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, typeof (_d = typeof shared_dto_2.UpdateInvoiceDto !== "undefined" && shared_dto_2.UpdateInvoiceDto) === "function" ? _d : Object, Object]),
    tslib_1.__metadata("design:returntype", void 0)
], InvoicesController.prototype, "update", null);
tslib_1.__decorate([
    (0, common_1.Post)(':id/pay'),
    (0, common_1.UseGuards)(role_guard_1.RoleGuard),
    (0, roles_decorator_1.Roles)('STAFF', 'ADMIN'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)('paymentMethod')),
    tslib_1.__param(2, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, typeof (_e = typeof client_1.PaymentMethod !== "undefined" && client_1.PaymentMethod) === "function" ? _e : Object, Object]),
    tslib_1.__metadata("design:returntype", void 0)
], InvoicesController.prototype, "markAsPaid", null);
tslib_1.__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(role_guard_1.RoleGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", void 0)
], InvoicesController.prototype, "remove", null);
exports.InvoicesController = InvoicesController = tslib_1.__decorate([
    (0, common_1.Controller)('api/invoices'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof invoices_service_1.InvoicesService !== "undefined" && invoices_service_1.InvoicesService) === "function" ? _a : Object])
], InvoicesController);


/***/ }),
/* 54 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.QuotationsModule = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const quotations_service_1 = __webpack_require__(55);
const quotations_controller_1 = __webpack_require__(57);
const quotation_repository_1 = __webpack_require__(56);
const database_1 = __webpack_require__(14);
let QuotationsModule = class QuotationsModule {
};
exports.QuotationsModule = QuotationsModule;
exports.QuotationsModule = QuotationsModule = tslib_1.__decorate([
    (0, common_1.Module)({
        controllers: [quotations_controller_1.QuotationsController],
        providers: [quotations_service_1.QuotationsService, quotation_repository_1.QuotationRepository, database_1.PrismaService],
        exports: [quotations_service_1.QuotationsService],
    })
], QuotationsModule);


/***/ }),
/* 55 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.QuotationsService = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const quotation_repository_1 = __webpack_require__(56);
const database_1 = __webpack_require__(14);
let QuotationsService = class QuotationsService {
    constructor(quotationRepository, prisma) {
        this.quotationRepository = quotationRepository;
        this.prisma = prisma;
    }
    async create(createQuoteDto, userId) {
        console.log('Service: Starting quotation creation...');
        console.log('Service: Received data:', JSON.stringify(createQuoteDto, null, 2));
        try {
            const { items, ...quoteData } = createQuoteDto;
            // Get customer information
            const customer = await this.prisma.customer.findUnique({
                where: { id: createQuoteDto.customerId }
            });
            if (!customer) {
                throw new Error(`Customer not found: ${createQuoteDto.customerId}`);
            }
            const customerName = `${customer.firstName} ${customer.lastName}`.trim();
            // Generate quotation number
            const quotationNumber = `Q${Date.now().toString().slice(-8)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
            console.log('Service: Generated quotation number:', quotationNumber);
            // Calculate totals
            let subtotal = 0;
            const processedItems = items.map(item => {
                const total = item.quantity * item.unitPrice;
                subtotal += total;
                return {
                    ...item,
                    total,
                };
            });
            console.log('Service: Processed items count:', processedItems.length);
            // Calculate taxes
            const gstRate = quoteData.gstRate ?? 0.05; // Default 5% GST
            const pstRate = quoteData.pstRate ?? 0.07; // Default 7% PST
            const gstAmount = subtotal * gstRate;
            const pstAmount = subtotal * pstRate;
            const taxRate = gstRate + pstRate;
            const taxAmount = gstAmount + pstAmount;
            const total = subtotal + taxAmount;
            console.log('Service: Calculated totals - subtotal:', subtotal, 'total:', total);
            // Set valid until date if not provided (30 days from now)
            const validUntil = quoteData.validUntil
                ? new Date(quoteData.validUntil)
                : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            console.log('Service: About to call repository create...');
            const result = await this.quotationRepository.create({
                ...quoteData,
                quotationNumber,
                customerName,
                businessName: customer.businessName,
                phone: customer.phone,
                email: customer.email,
                address: customer.address,
                subtotal,
                gstRate,
                gstAmount,
                pstRate,
                pstAmount,
                taxRate,
                taxAmount,
                total,
                validUntil,
                status: quoteData.status || 'DRAFT',
                createdBy: userId,
                items: {
                    create: processedItems,
                },
            });
            console.log('Service: Successfully created quotation:', result.id);
            return result;
        }
        catch (error) {
            console.error('Service: Error creating quotation:', error);
            throw error;
        }
    }
    async findAll() {
        return this.quotationRepository.findAll();
    }
    async findOne(id) {
        const quotation = await this.quotationRepository.findOne(id);
        if (!quotation) {
            throw new common_1.NotFoundException(`Quotation with ID ${id} not found`);
        }
        return quotation;
    }
    async update(id, updateQuoteDto) {
        const existingQuotation = await this.findOne(id);
        const { items, ...quoteData } = updateQuoteDto;
        // If items are being updated, recalculate totals
        if (items) {
            // Delete existing items
            await this.quotationRepository.deleteItems(id);
            // Calculate new totals
            let subtotal = 0;
            const processedItems = items.map(item => {
                const total = item.quantity * item.unitPrice;
                subtotal += total;
                return {
                    ...item,
                    quotationId: id,
                    total,
                };
            });
            // Calculate taxes
            const gstRate = quoteData.gstRate ?? existingQuotation.gstRate ?? 0.05;
            const pstRate = quoteData.pstRate ?? existingQuotation.pstRate ?? 0.07;
            const gstAmount = subtotal * Number(gstRate);
            const pstAmount = subtotal * Number(pstRate);
            const taxRate = Number(gstRate) + Number(pstRate);
            const taxAmount = gstAmount + pstAmount;
            const total = subtotal + taxAmount;
            // Create new items
            await this.quotationRepository.createItems(processedItems);
            // Update quotation with new totals
            return this.quotationRepository.update(id, {
                ...quoteData,
                subtotal,
                gstRate,
                gstAmount,
                pstRate,
                pstAmount,
                taxRate,
                taxAmount,
                total,
            });
        }
        // If no items update, just update the quotation data
        return this.quotationRepository.update(id, quoteData);
    }
    async remove(id) {
        await this.findOne(id); // Check if exists
        await this.quotationRepository.delete(id);
    }
    async search(params) {
        return this.quotationRepository.search(params);
    }
    async convertToInvoice(quotationId, customerId, vehicleId) {
        const quotation = await this.quotationRepository.findOne(quotationId);
        if (quotation.status === 'CONVERTED') {
            throw new Error('Quotation has already been converted to an invoice');
        }
        // Create invoice from quotation
        const invoice = await this.prisma.invoice.create({
            data: {
                customerId,
                vehicleId,
                subtotal: quotation.subtotal,
                taxRate: quotation.taxRate,
                taxAmount: quotation.taxAmount,
                gstRate: quotation.gstRate,
                gstAmount: quotation.gstAmount,
                pstRate: quotation.pstRate,
                pstAmount: quotation.pstAmount,
                total: quotation.total,
                status: 'PENDING',
                notes: quotation.notes,
                createdBy: quotation.createdBy,
                items: {
                    create: quotation.items.map(item => ({
                        tireId: item.tireId,
                        itemType: item.itemType,
                        description: item.description,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        total: item.total,
                    })),
                },
            },
            include: {
                customer: true,
                vehicle: true,
                items: {
                    include: {
                        tire: true,
                    },
                },
            },
        });
        // Update quotation status
        await this.quotationRepository.convertToInvoice(quotationId, invoice.id);
        return invoice;
    }
};
exports.QuotationsService = QuotationsService;
exports.QuotationsService = QuotationsService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof quotation_repository_1.QuotationRepository !== "undefined" && quotation_repository_1.QuotationRepository) === "function" ? _a : Object, typeof (_b = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _b : Object])
], QuotationsService);


/***/ }),
/* 56 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.QuotationRepository = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const database_1 = __webpack_require__(14);
let QuotationRepository = class QuotationRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.quotation.create({
            data,
            include: {
                items: {
                    include: {
                        tire: true,
                    },
                },
            },
        });
    }
    async findAll() {
        return this.prisma.quotation.findMany({
            include: {
                items: {
                    include: {
                        tire: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findOne(id) {
        return this.prisma.quotation.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        tire: true,
                    },
                },
            },
        });
    }
    async findByNumber(quotationNumber) {
        return this.prisma.quotation.findUnique({
            where: { quotationNumber },
            include: {
                items: {
                    include: {
                        tire: true,
                    },
                },
            },
        });
    }
    async update(id, data) {
        return this.prisma.quotation.update({
            where: { id },
            data,
            include: {
                items: {
                    include: {
                        tire: true,
                    },
                },
            },
        });
    }
    async delete(id) {
        return this.prisma.quotation.delete({
            where: { id },
        });
    }
    async deleteItems(quotationId) {
        await this.prisma.quotationItem.deleteMany({
            where: { quotationId },
        });
    }
    async createItems(items) {
        await this.prisma.quotationItem.createMany({
            data: items,
        });
    }
    async search(params) {
        const where = {};
        if (params.customerName) {
            where.OR = [
                {
                    customerName: {
                        contains: params.customerName,
                        mode: 'insensitive',
                    },
                },
                {
                    businessName: {
                        contains: params.customerName,
                        mode: 'insensitive',
                    },
                },
            ];
        }
        if (params.quotationNumber) {
            where.quotationNumber = {
                contains: params.quotationNumber,
                mode: 'insensitive',
            };
        }
        if (params.status) {
            where.status = params.status;
        }
        if (params.startDate || params.endDate) {
            where.createdAt = {};
            if (params.startDate) {
                where.createdAt.gte = new Date(params.startDate);
            }
            if (params.endDate) {
                where.createdAt.lte = new Date(params.endDate);
            }
        }
        return this.prisma.quotation.findMany({
            where,
            include: {
                items: {
                    include: {
                        tire: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async convertToInvoice(quotationId, invoiceId) {
        return this.prisma.quotation.update({
            where: { id: quotationId },
            data: {
                status: 'CONVERTED',
                convertedToInvoiceId: invoiceId,
            },
        });
    }
};
exports.QuotationRepository = QuotationRepository;
exports.QuotationRepository = QuotationRepository = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object])
], QuotationRepository);


/***/ }),
/* 57 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.QuotationsController = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const quotations_service_1 = __webpack_require__(55);
const shared_dto_1 = __webpack_require__(41);
const shared_dto_2 = __webpack_require__(41);
const jwt_auth_guard_1 = __webpack_require__(23);
const role_guard_1 = __webpack_require__(28);
const roles_decorator_1 = __webpack_require__(29);
let QuotationsController = class QuotationsController {
    constructor(quotationsService) {
        this.quotationsService = quotationsService;
    }
    create(createQuoteDto, req) {
        const userId = req.user?.sub || req.user?.id || 'system';
        console.log('Creating quotation with userId:', userId, 'user object:', req.user);
        return this.quotationsService.create(createQuoteDto, userId);
    }
    findAll() {
        return this.quotationsService.findAll();
    }
    search(customerName, quotationNumber, status, startDate, endDate) {
        return this.quotationsService.search({
            customerName,
            quotationNumber,
            status,
            startDate,
            endDate,
        });
    }
    findOne(id) {
        return this.quotationsService.findOne(id);
    }
    update(id, updateQuoteDto) {
        return this.quotationsService.update(id, updateQuoteDto);
    }
    remove(id) {
        return this.quotationsService.remove(id);
    }
    convertToInvoice(id, body) {
        return this.quotationsService.convertToInvoice(id, body.customerId, body.vehicleId);
    }
};
exports.QuotationsController = QuotationsController;
tslib_1.__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('ADMIN', 'STAFF'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__param(1, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_b = typeof shared_dto_1.CreateQuoteDto !== "undefined" && shared_dto_1.CreateQuoteDto) === "function" ? _b : Object, Object]),
    tslib_1.__metadata("design:returntype", void 0)
], QuotationsController.prototype, "create", null);
tslib_1.__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('ADMIN', 'STAFF'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], QuotationsController.prototype, "findAll", null);
tslib_1.__decorate([
    (0, common_1.Get)('search'),
    (0, roles_decorator_1.Roles)('ADMIN', 'STAFF'),
    tslib_1.__param(0, (0, common_1.Query)('customerName')),
    tslib_1.__param(1, (0, common_1.Query)('quotationNumber')),
    tslib_1.__param(2, (0, common_1.Query)('status')),
    tslib_1.__param(3, (0, common_1.Query)('startDate')),
    tslib_1.__param(4, (0, common_1.Query)('endDate')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, String, String, String]),
    tslib_1.__metadata("design:returntype", void 0)
], QuotationsController.prototype, "search", null);
tslib_1.__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'STAFF'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", void 0)
], QuotationsController.prototype, "findOne", null);
tslib_1.__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'STAFF'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, typeof (_c = typeof shared_dto_2.UpdateQuoteDto !== "undefined" && shared_dto_2.UpdateQuoteDto) === "function" ? _c : Object]),
    tslib_1.__metadata("design:returntype", void 0)
], QuotationsController.prototype, "update", null);
tslib_1.__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'STAFF'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", void 0)
], QuotationsController.prototype, "remove", null);
tslib_1.__decorate([
    (0, common_1.Post)(':id/convert'),
    (0, roles_decorator_1.Roles)('ADMIN', 'STAFF'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", void 0)
], QuotationsController.prototype, "convertToInvoice", null);
exports.QuotationsController = QuotationsController = tslib_1.__decorate([
    (0, common_1.Controller)('api/quotations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, role_guard_1.RoleGuard),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof quotations_service_1.QuotationsService !== "undefined" && quotations_service_1.QuotationsService) === "function" ? _a : Object])
], QuotationsController);


/***/ }),
/* 58 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HealthModule = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const health_controller_1 = __webpack_require__(59);
const health_service_1 = __webpack_require__(60);
const database_1 = __webpack_require__(14);
let HealthModule = class HealthModule {
};
exports.HealthModule = HealthModule;
exports.HealthModule = HealthModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [database_1.DatabaseModule],
        controllers: [health_controller_1.HealthController],
        providers: [health_service_1.HealthService],
        exports: [health_service_1.HealthService],
    })
], HealthModule);


/***/ }),
/* 59 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HealthController = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const health_service_1 = __webpack_require__(60);
const public_decorator_1 = __webpack_require__(21);
let HealthController = class HealthController {
    constructor(healthService) {
        this.healthService = healthService;
    }
    async check() {
        return await this.healthService.check();
    }
    async checkDetailed() {
        return await this.healthService.checkDetailed();
    }
};
exports.HealthController = HealthController;
tslib_1.__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], HealthController.prototype, "check", null);
tslib_1.__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('detailed'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], HealthController.prototype, "checkDetailed", null);
exports.HealthController = HealthController = tslib_1.__decorate([
    (0, common_1.Controller)('health'),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof health_service_1.HealthService !== "undefined" && health_service_1.HealthService) === "function" ? _a : Object])
], HealthController);


/***/ }),
/* 60 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HealthService = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const database_1 = __webpack_require__(14);
let HealthService = class HealthService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async check() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
        };
    }
    async checkDetailed() {
        const basicHealth = await this.check();
        // Check database connectivity
        let databaseStatus = 'unknown';
        try {
            await this.prisma.$queryRaw `SELECT 1`;
            databaseStatus = 'connected';
        }
        catch (error) {
            databaseStatus = 'disconnected';
        }
        return {
            ...basicHealth,
            database: databaseStatus,
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
                unit: 'MB',
            },
            version: process.env.APP_VERSION || '1.0.0',
        };
    }
};
exports.HealthService = HealthService;
exports.HealthService = HealthService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object])
], HealthService);


/***/ }),
/* 61 */
/***/ ((module) => {

module.exports = require("@clerk/clerk-sdk-node");

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/create fake namespace object */
/******/ 	(() => {
/******/ 		var getProto = Object.getPrototypeOf ? (obj) => (Object.getPrototypeOf(obj)) : (obj) => (obj.__proto__);
/******/ 		var leafPrototypes;
/******/ 		// create a fake namespace object
/******/ 		// mode & 1: value is a module id, require it
/******/ 		// mode & 2: merge all properties of value into the ns
/******/ 		// mode & 4: return value when already ns object
/******/ 		// mode & 16: return value when it's Promise-like
/******/ 		// mode & 8|1: behave like require
/******/ 		__webpack_require__.t = function(value, mode) {
/******/ 			if(mode & 1) value = this(value);
/******/ 			if(mode & 8) return value;
/******/ 			if(typeof value === 'object' && value) {
/******/ 				if((mode & 4) && value.__esModule) return value;
/******/ 				if((mode & 16) && typeof value.then === 'function') return value;
/******/ 			}
/******/ 			var ns = Object.create(null);
/******/ 			__webpack_require__.r(ns);
/******/ 			var def = {};
/******/ 			leafPrototypes = leafPrototypes || [null, getProto({}), getProto([]), getProto(getProto)];
/******/ 			for(var current = mode & 2 && value; typeof current == 'object' && !~leafPrototypes.indexOf(current); current = getProto(current)) {
/******/ 				Object.getOwnPropertyNames(current).forEach((key) => (def[key] = () => (value[key])));
/******/ 			}
/******/ 			def['default'] = () => (value);
/******/ 			__webpack_require__.d(ns, def);
/******/ 			return ns;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
__webpack_require__(1);
const common_1 = __webpack_require__(2);
const core_1 = __webpack_require__(3);
const app_module_1 = __webpack_require__(4);
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    // Enable CORS
    app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:4200',
        credentials: true,
    });
    // Global validation pipe
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
    }));
    const port = process.env.PORT || 3000;
    await app.listen(port);
    common_1.Logger.log(`🚀 Application is running on: http://localhost:${port}`);
}
bootstrap();

})();

/******/ })()
;
//# sourceMappingURL=main.js.map