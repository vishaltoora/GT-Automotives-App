import { colors } from './colors';
declare module '@mui/material/styles' {
    interface Theme {
        custom: {
            colors: typeof colors;
            spacing: {
                section: string;
                card: string;
            };
            borderRadius: {
                small: string;
                medium: string;
                large: string;
            };
        };
    }
    interface ThemeOptions {
        custom?: {
            colors?: typeof colors;
            spacing?: {
                section?: string;
                card?: string;
            };
            borderRadius?: {
                small?: string;
                medium?: string;
                large?: string;
            };
        };
    }
}
export declare const theme: import("@mui/material").Theme;
export declare const darkTheme: import("@mui/material").Theme;
//# sourceMappingURL=theme.d.ts.map