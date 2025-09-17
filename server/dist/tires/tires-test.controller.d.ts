export declare class TiresTestController {
    testEndpoint(): Promise<{
        message: string;
        timestamp: string;
        endpoints: string[];
    }>;
    healthCheck(): Promise<{
        status: string;
        module: string;
        database: string;
        timestamp: string;
    }>;
}
//# sourceMappingURL=tires-test.controller.d.ts.map