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
    h1: {
      fontSize: '3rem',
      fontWeight: 700,
      lineHeight: 1.2,
      '@media (max-width:600px)': {
        fontSize: '2rem',
      },
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.3,
      '@media (max-width:600px)': {
        fontSize: '1.75rem',
      },
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.4,
      '@media (max-width:600px)': {
        fontSize: '1.5rem',
      },
    },
    h4: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.5,
      '@media (max-width:600px)': {
        fontSize: '1.25rem',
      },
    },
    h5: {
      fontSize: '1.5rem',
      fontWeight: 500,
      lineHeight: 1.6,
      '@media (max-width:600px)': {
        fontSize: '1.15rem',
      },
    },
    h6: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.6,
      '@media (max-width:600px)': {
        fontSize: '1.1rem',
      },
    },
    subtitle1: {
      fontSize: '1.125rem',
      fontWeight: 500,
      lineHeight: 1.75,
    },
    subtitle2: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.57,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.75,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.65,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '1rem',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.66,
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 600,
      letterSpacing: '0.5px',
      textTransform: 'uppercase',
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
          paddingLeft: 24,
          paddingRight: 24,
          '@media (min-width:600px)': {
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