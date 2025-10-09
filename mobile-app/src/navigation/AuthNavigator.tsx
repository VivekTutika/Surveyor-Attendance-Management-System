import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Colors, Typography } from '../theme';
import { AuthStackParamList } from '../types';

import LoginScreen from '../screens/Auth/LoginScreen';

const Stack = createStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: Colors.textOnPrimary,
        headerTitleStyle: {
          fontSize: Typography.styles.h3.fontSize,
          fontWeight: Typography.styles.h3.fontWeight as any,
          color: Colors.textOnPrimary,
        },
        cardStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          title: 'Surveyor Login',
          headerShown: false, // Hide header for login screen
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;