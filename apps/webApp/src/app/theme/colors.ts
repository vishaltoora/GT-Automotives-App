/**
 * GT Automotivess Brand Colors
 * Centralized color palette for consistent theming across the application
 */

import { colorPalette } from './colorPalette';

export const colors = {
  // Primary brand colors - GT Navy Blue
  primary: {
    main: colorPalette.primary800,      // GT Navy blue
    light: colorPalette.primary700,     // Lighter blue for hover states
    lighter: colorPalette.primary600,   // Accent blue
    dark: colorPalette.primary900,      // Dark blue for emphasis
    contrast: colorPalette.white,       // Text on primary
  },

  // Secondary brand colors - Energetic orange for CTAs
  secondary: {
    main: colorPalette.secondary800,      // Vibrant orange
    light: colorPalette.secondary700,     // Light orange for hover
    lighter: colorPalette.secondary600,   // Soft orange
    dark: colorPalette.secondary900,      // Dark orange for emphasis
    contrast: colorPalette.white,         // Text on secondary
  },

  // Neutral colors - Grays for UI elements
  neutral: {
    50: colorPalette.grey50,
    100: colorPalette.grey100,
    200: colorPalette.grey200,
    300: colorPalette.grey300,
    400: colorPalette.grey400,
    500: colorPalette.grey500,
    600: colorPalette.grey600,
    700: colorPalette.grey700,
    800: colorPalette.grey800,
    900: colorPalette.grey900,
  },

  // Semantic colors for states and feedback
  semantic: {
    success: colorPalette.success500,
    successLight: colorPalette.success400,
    successDark: colorPalette.success700,

    warning: colorPalette.warning500,
    warningLight: colorPalette.warning400,
    warningDark: colorPalette.warning700,

    error: colorPalette.error500,
    errorLight: colorPalette.error400,
    errorDark: colorPalette.error700,

    info: colorPalette.info500,
    infoLight: colorPalette.info400,
    infoDark: colorPalette.info700,
  },

  // Background colors
  background: {
    default: colorPalette.white,
    paper: colorPalette.white,
    light: colorPalette.grey25,
    dark: colorPalette.grey900,
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  // Text colors
  text: {
    primary: colorPalette.grey800,
    secondary: colorPalette.grey600,
    disabled: colorPalette.grey400,
    hint: colorPalette.grey300,
    light: colorPalette.white,
    dark: colorPalette.black,
  },

  // Special purpose colors
  tire: {
    new: colorPalette.success500,       // Green for new tires
    used: colorPalette.warning500,      // Orange for used tires
    premium: colorPalette.info700,      // Purple for premium tires
  },

  // Service category colors
  service: {
    maintenance: colorPalette.info500,      // Blue for maintenance
    repair: colorPalette.error600,          // Red-orange for repairs
    inspection: colorPalette.info800,       // Purple for inspections
    tires: colorPalette.secondary800,       // Orange for tire services
  },

  // Social media colors (for footer/contact)
  social: {
    facebook: '#1877f2',
    twitter: '#1da1f2',
    instagram: '#e4405f',
    youtube: '#ff0000',
    google: '#4285f4',
  },

  // Gradient colors for hero sections
  gradients: {
    primary: colorPalette.primaryGradient,
    secondary: colorPalette.secondaryGradient,
    hero: colorPalette.heroGradient,
    dark: colorPalette.darkGradient,
  },

  // Shadow colors
  shadows: {
    light: 'rgba(0, 0, 0, 0.1)',
    medium: 'rgba(0, 0, 0, 0.2)',
    dark: 'rgba(0, 0, 0, 0.3)',
  },
} as const;

// Type-safe color getter function
export const getColor = (path: string): string => {
  const keys = path.split('.');
  let result: any = colors;
  
  for (const key of keys) {
    result = result?.[key];
    if (result === undefined) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`Color not found: ${path}`);
      }
      return '#000000';
    }
  }
  
  return result;
};

// Export individual color groups for convenience
export const { primary, secondary, neutral, semantic, background, text } = colors;