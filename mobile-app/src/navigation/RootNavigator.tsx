import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector, useDispatch } from 'react-redux';
import { loadStoredAuth } from '../store/authSlice';

import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import { Colors } from '../theme';
import { RootStackParamList, RootState } from '../types';
import { LoadingSpinner } from '../components';

const Stack = createStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const { isAuthenticated, token, loading } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [isInitialized, setIsInitialized] = useState(false);

  // Load stored authentication on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await dispatch(loadStoredAuth() as any);
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