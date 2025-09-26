/**
 * GT Automotives Brand Colors
 * Centralized color palette for consistent theming across the application
 */

export const colors = {
  // Primary brand colors - GT Navy Blue
  primary: {
    main: '#243c55',      // GT Navy blue
    light: '#3a5270',     // Lighter blue for hover states
    lighter: '#4a90e2',   // Accent blue
    dark: '#1a2d40',      // Dark blue for emphasis
    contrast: '#ffffff',  // Text on primary
  },

  // Secondary brand colors - Energetic orange for CTAs
  secondary: {
    main: '#ff6b35',      // Vibrant orange
    light: '#ff8c5a',     // Light orange for hover
    lighter: '#ffb088',   // Soft orange
    dark: '#e55100',      // Dark orange for emphasis
    contrast: '#ffffff',  // Text on secondary
  },

  // Neutral colors - Grays for UI elements
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },

  // Semantic colors for states and feedback
  semantic: {
    success: '#4caf50',
    successLight: '#81c784',
    successDark: '#388e3c',
    
    warning: '#ff9800',
    warningLight: '#ffb74d',
    warningDark: '#f57c00',
    
    error: '#f44336',
    errorLight: '#e57373',
    errorDark: '#d32f2f',
    
    info: '#2196f3',
    infoLight: '#64b5f6',
    infoDark: '#1976d2',
  },

  // Background colors
  background: {
    default: '#ffffff',
    paper: '#ffffff',
    light: '#f8f9fa',
    dark: '#1a1a1a',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  // Text colors
  text: {
    primary: '#212121',
    secondary: '#616161',
    disabled: '#9e9e9e',
    hint: '#bdbdbd',
    light: '#ffffff',
    dark: '#000000',
  },

  // Special purpose colors
  tire: {
    new: '#4caf50',       // Green for new tires
    used: '#ff9800',      // Orange for used tires
    premium: '#7b68ee',   // Purple for premium tires
  },

  // Service category colors
  service: {
    maintenance: '#2196f3',  // Blue for maintenance
    repair: '#ff5722',       // Red-orange for repairs
    inspection: '#9c27b0',   // Purple for inspections
    tires: '#ff6b35',        // Orange for tire services
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
    primary: 'linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%)',
    secondary: 'linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%)',
    hero: 'linear-gradient(135deg, #1e3a5f 0%, #4a90e2 100%)',
    dark: 'linear-gradient(135deg, #0f1f33 0%, #1e3a5f 100%)',
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