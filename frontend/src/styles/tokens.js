/**
 * ZeroPrint Design Tokens
 * Single source of truth for all design values across the application
 */

const tokens = {
  colors: {
    // Primary Brand Colors
    primaryGreen: '#2E7D32',
    solarYellow: '#FBC02D',
    infoBlue: '#0288D1',

    // Neutral Colors
    darkGray: '#424242',
    white: '#FFFFFF',
    lightGray: '#F5F5F5',

    // Semantic Colors
    success: '#2E7D32',
    danger: '#E53935',
    warning: '#FF9800',
    info: '#0288D1',

    // Extended Palette for Dark Mode
    gray: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#EEEEEE',
      300: '#E0E0E0',
      400: '#BDBDBD',
      500: '#9E9E9E',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },

    // Green Variants
    green: {
      50: '#E8F5E8',
      100: '#C8E6C8',
      200: '#A5D6A7',
      300: '#81C784',
      400: '#66BB6A',
      500: '#4CAF50',
      600: '#43A047',
      700: '#388E3C',
      800: '#2E7D32',
      900: '#1B5E20',
    },

    // Yellow Variants
    yellow: {
      50: '#FFFDE7',
      100: '#FFF9C4',
      200: '#FFF59D',
      300: '#FFF176',
      400: '#FFEE58',
      500: '#FFEB3B',
      600: '#FDD835',
      700: '#FBC02D',
      800: '#F9A825',
      900: '#F57F17',
    },

    // Blue Variants
    blue: {
      50: '#E3F2FD',
      100: '#BBDEFB',
      200: '#90CAF9',
      300: '#64B5F6',
      400: '#42A5F5',
      500: '#2196F3',
      600: '#1E88E5',
      700: '#1976D2',
      800: '#1565C0',
      900: '#0D47A1',
    },
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
    '3xl': '48px',
    '4xl': '64px',
    '5xl': '96px',
  },

  borderRadius: {
    none: '0px',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    full: '9999px',
  },

  shadows: {
    small: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    large: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },

  typography: {
    fontFamily: {
      heading: ['Poppins', 'system-ui', 'sans-serif'],
      body: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['Roboto Mono', 'Consolas', 'monospace'],
    },

    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
      '5xl': '48px',
    },

    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },

    lineHeight: {
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
    },

    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },

  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  zIndex: {
    hide: '-1',
    auto: 'auto',
    base: '0',
    docked: '10',
    dropdown: '1000',
    sticky: '1100',
    banner: '1200',
    overlay: '1300',
    modal: '1400',
    popover: '1500',
    skipLink: '1600',
    toast: '1700',
    tooltip: '1800',
  },

  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },

    easing: {
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
};

// Export individual token categories for easier imports
const colors = tokens.colors;
const spacing = tokens.spacing;
const borderRadius = tokens.borderRadius;
const shadows = tokens.shadows;
const typography = tokens.typography;
const breakpoints = tokens.breakpoints;
const zIndex = tokens.zIndex;
const animation = tokens.animation;

// JSON export for external tools (Storybook, etc.)
const tokensJSON = JSON.stringify(tokens, null, 2);

module.exports = {
  tokens,
  colors,
  spacing,
  borderRadius,
  shadows,
  typography,
  breakpoints,
  zIndex,
  animation,
  tokensJSON,
};
