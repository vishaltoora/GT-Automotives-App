export declare enum RoleName {
    CUSTOMER = "CUSTOMER",
    STAFF = "STAFF",
    ADMIN = "ADMIN"
}
export declare enum Resource {
    USERS = "users",
    CUSTOMERS = "customers",
    VEHICLES = "vehicles",
    TIRES = "tires",
    INVOICES = "invoices",
    APPOINTMENTS = "appointments",
    REPORTS = "reports",
    SETTINGS = "settings"
}
export declare enum Action {
    CREATE = "create",
    READ = "read",
    UPDATE = "update",
    DELETE = "delete",
    EXPORT = "export",
    APPROVE = "approve"
}
export declare class PermissionDefinitionDto {
    resource: Resource;
    action: Action;
}
export declare class RolePermissionsConfigDto {
    role: RoleName;
    permissions: PermissionDefinitionDto[];
}
export declare const PERMISSIONS: Record<RoleName, PermissionDefinitionDto[]>;
