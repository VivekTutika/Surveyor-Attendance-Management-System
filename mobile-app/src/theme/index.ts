import { Colors, ColorPalette } from './colors';
import { Typography, TypographyTheme } from './typography';

export interface Spacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface BorderRadius {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  round: number;
}

export interface ShadowStyle {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

export interface Shadows {
  sm: ShadowStyle;
  md: ShadowStyle;
  lg: ShadowStyle;
}

export interface ButtonTheme {
  height: number;
  borderRadius: number;
  paddingHorizontal: number;
}

export interface InputTheme {
  height: number;
  borderRadius: number;
  paddingHorizontal: number;
  borderWidth: number;
}

export interface CardTheme {
  borderRadius: number;
  padding: number;
  backgroundColor: string;
}

export interface ContainerTheme {
  flex: number;
  backgroundColor: string;
  paddingHorizontal: number;
}

export interface StatusBarTheme {
  backgroundColor: string;
  barStyle: 'light-content' | 'dark-content' | 'default';
}

export interface AppTheme {
  colors: ColorPalette;
  typography: TypographyTheme;
  spacing: Spacing;
  borderRadius: BorderRadius;
  shadows: Shadows;
  button: ButtonTheme;
  input: InputTheme;
  card: CardTheme;
  container: ContainerTheme;
  statusBar: StatusBarTheme;
}

export const Theme: AppTheme = {
  colors: Colors,
  typography: Typography,
  
  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // Border Radius
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    round: 50,
  },
  
  // Shadows
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
  },
  
  // Component Specific Themes
  button: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 24,
  },
  
  input: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  
  card: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: Colors.surface,
  },
  
  // Layout
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
  },
  
  // Status Bar
  statusBar: {
    backgroundColor: Colors.primary,
    barStyle: 'light-content',
  },
};

export { Colors, Typography };