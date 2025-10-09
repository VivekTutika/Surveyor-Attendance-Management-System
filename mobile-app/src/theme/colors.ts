export interface ColorPalette {
  // Primary Colors
  primary: string;
  primaryDark: string;
  primaryLight: string;
  
  // Secondary Colors
  secondary: string;
  secondaryDark: string;
  secondaryLight: string;
  
  // Accent Colors
  accent: string;
  accentDark: string;
  accentLight: string;
  
  // Status Colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Neutral Colors
  white: string;
  black: string;
  gray: string;
  lightGray: string;
  darkGray: string;
  
  // Background Colors
  background: string;
  surface: string;
  overlay: string;
  
  // Text Colors
  textPrimary: string;
  textSecondary: string;
  textDisabled: string;
  textOnPrimary: string;
  textOnSecondary: string;
  
  // Border Colors
  border: string;
  divider: string;
  
  // Attendance Status Colors
  morningAttendance: string;
  eveningAttendance: string;
  pendingAttendance: string;
  
  // Bike Meter Colors
  bikeMeterMorning: string;
  bikeMeterEvening: string;
}

export const Colors: ColorPalette = {
  // Primary Colors
  primary: '#1976D2',
  primaryDark: '#1565C0',
  primaryLight: '#42A5F5',
  
  // Secondary Colors
  secondary: '#388E3C',
  secondaryDark: '#2E7D32',
  secondaryLight: '#66BB6A',
  
  // Accent Colors
  accent: '#FF9800',
  accentDark: '#F57C00',
  accentLight: '#FFB74D',
  
  // Status Colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  // Neutral Colors
  white: '#FFFFFF',
  black: '#000000',
  gray: '#9E9E9E',
  lightGray: '#E0E0E0',
  darkGray: '#424242',
  
  // Background Colors
  background: '#F5F5F5',
  surface: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  // Text Colors
  textPrimary: '#212121',
  textSecondary: '#757575',
  textDisabled: '#BDBDBD',
  textOnPrimary: '#FFFFFF',
  textOnSecondary: '#FFFFFF',
  
  // Border Colors
  border: '#E0E0E0',
  divider: '#EEEEEE',
  
  // Attendance Status Colors
  morningAttendance: '#4CAF50',
  eveningAttendance: '#FF9800',
  pendingAttendance: '#9E9E9E',
  
  // Bike Meter Colors
  bikeMeterMorning: '#2196F3',
  bikeMeterEvening: '#9C27B0',
};