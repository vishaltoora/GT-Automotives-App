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
export declare enum PaymentMethod {
    CASH = "CASH",
    CREDIT_CARD = "CREDIT_CARD",
    DEBIT_CARD = "DEBIT_CARD",
    CHECK = "CHECK",
    E_TRANSFER = "E_TRANSFER",
    FINANCING = "FINANCING"
}
export declare enum InvoiceItemType {
    TIRE = "TIRE",
    SERVICE = "SERVICE",
    PART = "PART",
    OTHER = "OTHER"
}
