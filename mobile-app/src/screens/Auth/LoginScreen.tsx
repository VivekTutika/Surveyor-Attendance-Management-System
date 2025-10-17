import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { StackNavigationProp } from '@react-navigation/stack';
// @ts-ignore
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Button, InputField, LoadingSpinner } from '../../components';
import { Colors, Typography } from '../../theme';
import { loginUser, clearError, loadStoredAuth, logoutUser } from '../../store/authSlice';
import { RootState, AuthStackParamList } from '../../types';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

interface FormData {
  employeeId: string;
  password: string;
}

interface FormErrors {
  [key: string]: string | null;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<any>();
  const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState<FormData>({
    employeeId: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [rememberMe, setRememberMe] = useState<boolean>(false); // Default to false for security
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  useEffect(() => {
    // Load stored authentication and cached credentials
    const initialize = async () => {
      try {
        await loadCachedCredentials();
        await dispatch(loadStoredAuth());
      } finally {
        setIsInitializing(false);
      }
    };
    
    initialize();
  }, [dispatch]);

  const loadCachedCredentials = async () => {
    try {
      // Load rememberMe setting first
      const cachedRememberMe = await AsyncStorage.getItem('rememberMe');
      if (cachedRememberMe === 'true') {
        setRememberMe(true);
        
        // Load cached credentials if rememberMe was enabled
        const cachedCredentials = await AsyncStorage.getItem('cachedCredentials');
        if (cachedCredentials) {
          const { employeeId, password } = JSON.parse(cachedCredentials);
          setFormData({
            employeeId: employeeId || '',
            password: password || '',
          });
        }
      }
    } catch (error) {
      console.log('Error loading cached credentials:', error);
    }
  };

  useEffect(() => {
    // Clear any previous errors when component mounts
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.employeeId.trim()) {
      errors.employeeId = 'Employee ID is required';
    }

    if (!formData.password.trim()) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: null,
      }));
    }
    // Clear global auth error when user starts typing
    if (error) {
      dispatch(clearError())
    }
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      // Save rememberMe setting
      await AsyncStorage.setItem('rememberMe', rememberMe.toString());
      
      // Cache the credentials for next login if rememberMe is true
      if (rememberMe) {
        await AsyncStorage.setItem('cachedCredentials', JSON.stringify({
          employeeId: formData.employeeId,
          password: formData.password
        }));
      } else {
        // Clear cached credentials if rememberMe is false
        await AsyncStorage.removeItem('cachedCredentials');
      }
      
      const result: any = await dispatch(loginUser({
        mobileNumber: formData.employeeId, // backend expects employeeId; thunk maps this
        password: formData.password,
      })).unwrap();

      // Prevent non-surveyor roles from using the mobile app.
      const userRole = result?.user?.role || null;
      if (userRole && String(userRole).toLowerCase() !== 'surveyor') {
        // Immediately clear auth state so admin credentials don't remain active here.
        dispatch(logoutUser());
        Alert.alert('Access Denied', 'This mobile app is only for Surveyor users. Please use the admin portal.', [{ text: 'OK' }]);
        return;
      }
    } catch (error) {
      // Error handling is done through useEffect
    }
  };

  const handleRememberMeToggle = (value: boolean) => {
    setRememberMe(value);
    
    // If toggled off, clear cached credentials but preserve the setting
    if (!value) {
      AsyncStorage.removeItem('cachedCredentials');
    }
    // Always save the rememberMe setting
    AsyncStorage.setItem('rememberMe', value.toString());
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Show loading spinner while initializing
  if (isInitializing) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Image source={require('../../../assets/logo.png')} style={styles.logoImage} resizeMode="contain" />
              </View>
            <Text style={styles.title}>LRMC  SAMS</Text>
            <Text style={styles.subtitle}>Surveyor Attendance Management System</Text>
            <Text style={styles.welcomeText}>Welcome back! Please sign in to continue.</Text>
          </View>

          {/* Login Form */}
          <View style={styles.formContainer}>
            <InputField
              label="Employee ID"
              placeholder="Enter your employee ID"
              value={formData.employeeId}
              onChangeText={(value) => handleInputChange('employeeId', value)}
              keyboardType="default"
              error={formErrors.employeeId}
              leftIcon={
                <Ionicons name="person-outline" size={20} color={Colors.gray} />
              }
            />

            <InputField
              label="Password"
              placeholder="Enter your password"
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              secureTextEntry={!showPassword}
              error={formErrors.password}
              leftIcon={
                <Ionicons name="lock-closed-outline" size={20} color={Colors.gray} />
              }
              rightIcon={
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color={Colors.gray} 
                  onPress={togglePasswordVisibility}
                />
              }
            />

            <View style={styles.rememberMeContainer}>
              <Text style={styles.rememberMeText}>Remember Me</Text>
              <Switch
                trackColor={{ false: Colors.gray, true: Colors.primary }}
                thumbColor={rememberMe ? Colors.surface : Colors.surface}
                onValueChange={handleRememberMeToggle}
                value={rememberMe}
              />
            </View>

            {/* Inline login error message (persistent) */}
            {error ? (
              <Text style={{ color: Colors.error, marginTop: 8, marginBottom: 8 }}>{error}</Text>
            ) : null}

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.loginButton}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              LRMC Solutions © 2025
            </Text>
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {loading && <LoadingSpinner overlay />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    backgroundColor: Colors.surface,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  logoImage: {
    width: 64,
    height: 64,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 32,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  rememberMeText: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  loginButton: {
    marginTop: 8,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  versionText: {
    fontSize: 10,
    color: Colors.textDisabled,
  },
});

export default LoginScreen;