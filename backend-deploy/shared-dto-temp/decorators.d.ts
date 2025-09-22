interface ValidationOptions {
    message?: string | ((args: any) => string);
    groups?: string[];
    always?: boolean;
    each?: boolean;
}
export declare function IsString(options?: ValidationOptions): PropertyDecorator;
export declare function IsNumber(options?: ValidationOptions): PropertyDecorator;
export declare function IsEnum(enumType: any, options?: ValidationOptions): PropertyDecorator;
export declare function IsOptional(options?: ValidationOptions): PropertyDecorator;
export declare function Min(value: number, options?: ValidationOptions): PropertyDecorator;
export declare function IsEmail(options?: ValidationOptions): PropertyDecorator;
export declare function IsArray(options?: ValidationOptions): PropertyDecorator;
export declare function ValidateNested(options?: ValidationOptions): PropertyDecorator;
export declare function IsBoolean(options?: ValidationOptions): PropertyDecorator;
export declare function IsDate(options?: ValidationOptions): PropertyDecorator;
export declare function ValidateIf(condition: (object: any) => boolean, options?: ValidationOptions): PropertyDecorator;
export declare function IsPositive(options?: ValidationOptions): PropertyDecorator;
export declare function Type(typeFunction: () => any): PropertyDecorator;
export declare function PartialType<T>(classRef: new () => T): new () => Partial<T>;
export declare function OmitType<T, K extends keyof T>(classRef: new () => T, keys: readonly K[]): new () => Omit<T, K>;
export {};
//# sourceMappingURL=decorators.d.ts.map