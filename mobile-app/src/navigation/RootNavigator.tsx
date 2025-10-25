import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector, useDispatch } from 'react-redux';

import { LoadingSpinner } from '../components';
import { Colors } from '../theme';
import { RootState } from '../types';
import { loadStoredAuth, getUserProfile } from '../store/authSlice'; // Add getUserProfile import
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';

const Stack = createStackNavigator();

const RootNavigator: React.FC = () => {
  const { isAuthenticated, token, loading } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [isInitialized, setIsInitialized] = useState(false);

  // Load stored authentication on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await dispatch(loadStoredAuth() as any);
        // Fetch fresh user profile on app start if authenticated
        if (isAuthenticated && token) {
          try {
            await dispatch(getUserProfile() as any);
          } catch (e) {
            console.log('Failed to fetch user profile on init:', e);
          }
        }
      } finally {
        setIsInitialized(true);
      }
    };
    
    initializeAuth();
  }, [dispatch]);

  // Show loading screen while checking auth state
  if (!isInitialized) {
    return (
      <LoadingSpinner />
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: Colors.background },
        }}
      >
        {isAuthenticated && token ? (
          <Stack.Screen name="App" component={AppNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;