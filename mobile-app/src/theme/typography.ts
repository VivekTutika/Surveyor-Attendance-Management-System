export interface FontFamily {
  regular: string;
  medium: string;
  bold: string;
}

export interface FontSize {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  xxxl: number;
  huge: number;
}

export interface FontWeight {
  normal: string;
  medium: string;
  semiBold: string;
  bold: string;
}

export interface LineHeight {
  tight: number;
  normal: number;
  relaxed: number;
}

export interface LetterSpacing {
  tight: number;
  normal: number;
  wide: number;
}

export interface TextStyle {
  fontSize: number;
  fontWeight: string;
  lineHeight: number;
  letterSpacing?: number;
  textTransform?: 'uppercase' | 'lowercase' | 'capitalize' | 'none';
}

export interface TextStyles {
  h1: TextStyle;
  h2: TextStyle;
  h3: TextStyle;
  h4: TextStyle;
  body1: TextStyle;
  body2: TextStyle;
  caption: TextStyle;
  button: TextStyle;
  overline: TextStyle;
}

export interface TypographyTheme {
  fontFamily: FontFamily;
  fontSize: FontSize;
  fontWeight: FontWeight;
  lineHeight: LineHeight;
  letterSpacing: LetterSpacing;
  styles: TextStyles;
}

export const Typography: TypographyTheme = {
  // Font Families
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  
  // Font Sizes
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    huge: 32,
  },
  
  // Font Weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
  
  // Letter Spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
  
  // Text Styles
  styles: {
    h1: {
      fontSize: 28,
      fontWeight: '700',
      lineHeight: 1.2,
    },
    h2: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 1.3,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 1.3,
    },
    h4: {
      fontSize: 18,
      fontWeight: '500',
      lineHeight: 1.4,
    },
    body1: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 1.4,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 1.3,
    },
    button: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 1.4,
      letterSpacing: 0.5,
    },
    overline: {
      fontSize: 10,
      fontWeight: '400',
      lineHeight: 1.2,
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
  },
};