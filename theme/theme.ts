import { createTheme } from '@shopify/restyle';

const palette = {
  // Background colors
  backgroundDark: '#1a1a1a',
  backgroundOverlay: 'rgba(0, 0, 0, 0.7)',
  
  // Primary colors
  primary: '#4ECDC4',
  primaryDark: '#3a9d96',
  
  // Accent colors
  accent: '#FF6B6B',
  accentDark: '#e55a5a',
  
  // Text colors
  textPrimary: '#ffffff',
  textSecondary: '#4ECDC4',
  textMuted: 'rgba(255, 255, 255, 0.8)',
  
  // Border colors
  borderLight: 'rgba(255, 255, 255, 0.2)',
  
  // Shadow
  shadowColor: '#000000',
};

export const theme = createTheme({
  colors: {
    background: palette.backgroundDark,
    backgroundOverlay: palette.backgroundOverlay,
    primary: palette.primary,
    primaryDark: palette.primaryDark,
    accent: palette.accent,
    accentDark: palette.accentDark,
    textPrimary: palette.textPrimary,
    textSecondary: palette.textSecondary,
    textMuted: palette.textMuted,
    borderLight: palette.borderLight,
    shadowColor: palette.shadowColor,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 40,
  },
  borderRadii: {
    sm: 8,
    md: 12,
    lg: 16,
  },
  textVariants: {
    defaults: {
      color: 'textPrimary',
    },
    h1: {
      fontSize: 32,
      fontWeight: '700',
      color: 'textPrimary',
    },
    h2: {
      fontSize: 24,
      fontWeight: '600',
      color: 'textPrimary',
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
      color: 'textPrimary',
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400',
      color: 'textPrimary',
    },
    caption: {
      fontSize: 12,
      fontWeight: '400',
      color: 'textMuted',
    },
    button: {
      fontSize: 16,
      fontWeight: '600',
      color: 'textPrimary',
    },
    buttonSmall: {
      fontSize: 14,
      fontWeight: '600',
      color: 'textPrimary',
    },
  },
  cardVariants: {
    defaults: {
      backgroundColor: 'backgroundOverlay',
      borderRadius: 'sm',
      padding: 'md',
    },
  },
  buttonVariants: {
    defaults: {
      paddingHorizontal: 'xl',
      paddingVertical: 'lg',
      borderRadius: 'md',
    },
    primary: {
      backgroundColor: 'primary',
    },
    accent: {
      backgroundColor: 'accent',
    },
  },
});

export type Theme = typeof theme;
