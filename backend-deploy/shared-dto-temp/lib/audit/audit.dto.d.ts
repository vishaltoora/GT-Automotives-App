export declare class AuditLogDto {
    id: string;
    userId: string;
    action: string;
    resource: string;
    resourceId: string;
    oldValue?: any;
    newValue?: any;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
}
export declare class CreateAuditLogDto {
    userId: string;
    action: string;
    resource: string;
    resourceId: string;
    oldValue?: any;
    newValue?: any;
    ipAddress?: string;
    userAgent?: string;
}
