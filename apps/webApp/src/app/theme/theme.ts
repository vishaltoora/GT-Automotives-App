import { createTheme, ThemeOptions } from '@mui/material/styles';
import { colors } from './colors';

// Extend MUI theme with custom properties
declare module '@mui/material/styles' {
  interface Theme {
    custom: {
      colors: typeof colors;
      spacing: {
        section: string;
        card: string;
        // Responsive page padding
        pagePadding: {
          mobile: string;
          tablet: string;
          desktop: string;
        };
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
        pagePadding?: {
          mobile?: string;
          tablet?: string;
          desktop?: string;
        };
      };
      borderRadius?: {
        small?: string;
        medium?: string;
        large?: string;
      };
    };
  }
}

const themeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: colors.primary.main,
      light: colors.primary.light,
      dark: colors.primary.dark,
      contrastText: colors.primary.contrast,
    },
    secondary: {
      main: colors.secondary.main,
      light: colors.secondary.light,
      dark: colors.secondary.dark,
      contrastText: colors.secondary.contrast,
    },
    error: {
      main: colors.semantic.error,
      light: colors.semantic.errorLight,
      dark: colors.semantic.errorDark,
    },
    warning: {
      main: colors.semantic.warning,
      light: colors.semantic.warningLight,
      dark: colors.semantic.warningDark,
    },
    info: {
      main: colors.semantic.info,
      light: colors.semantic.infoLight,
      dark: colors.semantic.infoDark,
    },
    success: {
      main: colors.semantic.success,
      light: colors.semantic.successLight,
      dark: colors.semantic.successDark,
    },
    grey: {
      50: colors.neutral[50],
      100: colors.neutral[100],
      200: colors.neutral[200],
      300: colors.neutral[300],
      400: colors.neutral[400],
      500: colors.neutral[500],
      600: colors.neutral[600],
      700: colors.neutral[700],
      800: colors.neutral[800],
      900: colors.neutral[900],
    },
    background: {
      default: colors.background.default,
      paper: colors.background.paper,
    },
    text: {
      primary: colors.text.primary,
      secondary: colors.text.secondary,
      disabled: colors.text.disabled,
    },
  },
  typography: {
    // Modern font stack with system fonts for better performance
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),

    // Base font size for accessibility - users can override in browser settings
    htmlFontSize: 16,

    // Fluid typography using clamp() for smooth scaling
    // Pattern: clamp(min, preferred, max) where preferred = calc(base + viewport scaling)

    h1: {
      // Page titles - scales from 2rem (32px) to 3rem (48px)
      fontSize: 'clamp(2rem, 1.5rem + 2vw, 3rem)',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.02em', // Tighter spacing for large text
    },
    h2: {
      // Section titles - scales from 1.75rem (28px) to 2.5rem (40px)
      fontSize: 'clamp(1.75rem, 1.4rem + 1.5vw, 2.5rem)',
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h3: {
      // Card titles - scales from 1.5rem (24px) to 2rem (32px)
      fontSize: 'clamp(1.5rem, 1.3rem + 1vw, 2rem)',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      // Subsection headers - scales from 1.25rem (20px) to 1.75rem (28px)
      fontSize: 'clamp(1.25rem, 1.1rem + 0.75vw, 1.75rem)',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h5: {
      // Small headers - scales from 1.125rem (18px) to 1.5rem (24px)
      fontSize: 'clamp(1.125rem, 1rem + 0.5vw, 1.5rem)',
      fontWeight: 500,
      lineHeight: 1.6,
    },
    h6: {
      // Smallest headers - scales from 1rem (16px) to 1.25rem (20px)
      fontSize: 'clamp(1rem, 0.93rem + 0.33vw, 1.25rem)',
      fontWeight: 500,
      lineHeight: 1.6,
    },
    subtitle1: {
      // Large subtitle - scales from 1rem to 1.125rem
      fontSize: 'clamp(1rem, 0.95rem + 0.25vw, 1.125rem)',
      fontWeight: 500,
      lineHeight: 1.75,
    },
    subtitle2: {
      // Standard subtitle - fixed at 1rem for consistency
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.57,
    },
    body1: {
      // Primary body text - fixed at 1rem (16px) for optimal readability
      fontSize: '1rem',
      lineHeight: 1.75,
      letterSpacing: '0.00938em',
    },
    body2: {
      // Secondary body text - scales from 0.813rem to 0.875rem
      fontSize: 'clamp(0.813rem, 0.8rem + 0.125vw, 0.875rem)',
      lineHeight: 1.65,
    },
    button: {
      // Button text - scales from 0.875rem to 1rem
      fontSize: 'clamp(0.875rem, 0.85rem + 0.15vw, 1rem)',
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
    caption: {
      // Captions and helper text - scales from 0.7rem to 0.75rem
      fontSize: 'clamp(0.7rem, 0.68rem + 0.1vw, 0.75rem)',
      lineHeight: 1.66,
      letterSpacing: '0.03em',
    },
    overline: {
      // Labels and overlines - fixed for consistency
      fontSize: '0.75rem',
      fontWeight: 600,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      lineHeight: 2.66,
    },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          fontSize: '1rem',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
        },
        sizeLarge: {
          padding: '14px 32px',
          fontSize: '1.125rem',
        },
        sizeSmall: {
          padding: '6px 16px',
          fontSize: '0.875rem',
        },
        containedPrimary: {
          background: colors.gradients.primary,
          '&:hover': {
            background: colors.primary.dark,
          },
        },
        containedSecondary: {
          background: colors.gradients.secondary,
          '&:hover': {
            background: colors.secondary.dark,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        elevation1: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        },
        elevation2: {
          boxShadow: '0 4px 8px rgba(0,0,0,0.08)',
        },
        elevation3: {
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover fieldset': {
              borderColor: colors.primary.light,
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        },
      },
    },
    MuiContainer: {
      defaultProps: {
        maxWidth: 'lg',
      },
      styleOverrides: {
        root: {
          // Mobile: minimal padding for maximum screen utilization
          paddingLeft: 8,
          paddingRight: 8,
          '@media (min-width:600px)': {
            // Tablet and up: comfortable padding
            paddingLeft: 24,
            paddingRight: 24,
          },
          '@media (min-width:960px)': {
            // Desktop: standard padding
            paddingLeft: 32,
            paddingRight: 32,
          },
        },
      },
    },
  },
  custom: {
    colors,
    spacing: {
      section: '80px',
      card: '24px',
      // Consistent page padding across the application
      pagePadding: {
        mobile: '8px',   // Minimal padding on mobile for maximum screen utilization
        tablet: '16px',  // Comfortable padding on tablets
        desktop: '24px', // Standard desktop padding
      },
    },
    borderRadius: {
      small: '4px',
      medium: '8px',
      large: '12px',
    },
  },
};

// Create the theme
export const theme = createTheme(themeOptions);

// Dark theme variant
export const darkTheme = createTheme({
  ...themeOptions,
  palette: {
    ...themeOptions.palette,
    mode: 'dark',
    background: {
      default: colors.background.dark,
      paper: '#2a2a2a',
    },
    text: {
      primary: colors.text.light,
      secondary: '#b0b0b0',
      disabled: '#707070',
    },
  },
});