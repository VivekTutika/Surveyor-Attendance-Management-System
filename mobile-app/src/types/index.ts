// User and Authentication Types
export interface User {
  id: string;
  name: string;
  mobileNumber: string;
  role: 'Admin' | 'Surveyor';
  project?: string;
  location?: string;
  hasBike?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface LoginRequest {
  mobileNumber: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  message: string;
}

// Attendance Types
export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;
  type: 'Morning' | 'Evening';
  photoPath: string;
  latitude: number;
  longitude: number;
  capturedAt: string;
  status?: 'Present' | 'Absent' | 'Late';
}

export interface AttendanceState {
  records: AttendanceRecord[];
  todayAttendance: {
    morning: AttendanceRecord | null;
    evening: AttendanceRecord | null;
  };
  loading: boolean;
  error: string | null;
  submittingAttendance: boolean;
}

export interface AttendanceSubmission {
  type: 'Morning' | 'Evening';
  photoUri: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

// Bike Meter Types
export interface BikeReading {
  id: string;
  userId: string;
  date: string;
  type: 'Morning' | 'Evening';
  photoPath: string;
  reading?: number; // Manual entry if OCR is implemented
  capturedAt: string;
}

export interface BikeMeterState {
  readings: BikeReading[];
  todayReadings: {
    morning: BikeReading | null;
    evening: BikeReading | null;
  };
  loading: boolean;
  error: string | null;
  submittingReading: boolean;
}

export interface BikeReadingSubmission {
  type: 'Morning' | 'Evening';
  photoUri: string;
  reading?: number;
  timestamp: string;
}

// Location Types
export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
}

export interface GeoFence {
  id: string;
  name: string;
  coordinates: LocationCoordinates[];
  radius?: number;
  isActive: boolean;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface FormErrors {
  [key: string]: string | null;
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
};

export type AppStackParamList = {
  Dashboard: undefined;
  Profile: undefined;
};

export type DashboardStackParamList = {
  DashboardMain: undefined;
  Attendance: { type: string };
  BikeMeter: { type: string };
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
};

// Component Props Types
export interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  style?: any;
  textStyle?: any;
  icon?: React.ReactNode;
}

export interface InputFieldProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  error?: string | null;
  disabled?: boolean;
  multiline?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: any;
  inputStyle?: any;
  onRightIconPress?: () => void;
}

export interface CardProps {
  children: React.ReactNode;
  style?: any;
  onPress?: () => void;
  disabled?: boolean;
}

export interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  overlay?: boolean;
  text?: string;
  style?: any;
}

// Redux Store Types
export interface RootState {
  auth: AuthState;
  attendance: AttendanceState;
  bikeMeter: BikeMeterState;
}

// Import AppDispatch from store to avoid circular dependencies
export type AppDispatch = import('../store').AppDispatch;

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredField<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalField<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;