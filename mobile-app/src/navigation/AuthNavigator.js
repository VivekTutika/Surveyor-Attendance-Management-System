import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Colors, Typography } from '../theme';

import LoginScreen from '../screens/Auth/LoginScreen';

const Stack = createStackNavigator();

const AuthNavigator = () => {
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
          ...Typography.styles.h3,
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