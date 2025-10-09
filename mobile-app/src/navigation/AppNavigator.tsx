import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
// @ts-ignore
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography } from '../theme';
import { AppStackParamList, DashboardStackParamList, ProfileStackParamList } from '../types';

// Import screens
import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import AttendanceScreen from '../screens/Dashboard/AttendanceScreen';
import BikeMeterScreen from '../screens/Dashboard/BikeMeterScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';

const Tab = createBottomTabNavigator<AppStackParamList>();
const DashboardStackNavigator = createStackNavigator<DashboardStackParamList>();
const ProfileStackNavigator = createStackNavigator<ProfileStackParamList>();

// Dashboard Stack Navigator
const DashboardStack: React.FC = () => {
  return (
    <DashboardStackNavigator.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary,
          elevation: 4,
          shadowOpacity: 0.3,
        },
        headerTintColor: Colors.textOnPrimary,
        headerTitleStyle: {
          fontSize: Typography.styles.h3.fontSize,
          fontWeight: Typography.styles.h3.fontWeight as any,
          color: Colors.textOnPrimary,
        },
      }}
    >
      <DashboardStackNavigator.Screen
        name="DashboardMain"
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <DashboardStackNavigator.Screen
        name="Attendance"
        component={AttendanceScreen}
        options={{ title: 'Mark Attendance' }}
      />
      <DashboardStackNavigator.Screen
        name="BikeMeter"
        component={BikeMeterScreen}
        options={{ title: 'Bike Meter Reading' }}
      />
    </DashboardStackNavigator.Navigator>
  );
};

// Profile Stack Navigator
const ProfileStack: React.FC = () => {
  return (
    <ProfileStackNavigator.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary,
          elevation: 4,
          shadowOpacity: 0.3,
        },
        headerTintColor: Colors.textOnPrimary,
        headerTitleStyle: {
          fontSize: Typography.styles.h3.fontSize,
          fontWeight: Typography.styles.h3.fontWeight as any,
          color: Colors.textOnPrimary,
        },
      }}
    >
      <ProfileStackNavigator.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </ProfileStackNavigator.Navigator>
  );
};

const AppNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.gray,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          elevation: 8,
          shadowOpacity: 0.3,
          paddingVertical: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: Typography.styles.caption.fontSize,
          marginBottom: 4,
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardStack}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;