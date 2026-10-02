import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { DataProvider } from '../context/DataContext';

import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import DashboardScreen from '../screens/DashboardScreen';
import AvailabilityScreen from '../screens/AvailabilityScreen';
import PupilsScreen from '../screens/PupilsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const AuthStack = createNativeStackNavigator();

const ICONS = {
  Dashboard: 'calendar',
  Availability: 'add-circle',
  Pupils: 'people',
  Profile: 'person-circle',
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.go,
        tabBarInactiveTintColor: colors.inkMuted,
        tabBarStyle: { height: 64, paddingBottom: 10, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICONS[route.name]} size={route.name === 'Availability' ? size + 6 : size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Availability" component={AvailabilityScreen} />
      <Tab.Screen name="Pupils" component={PupilsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AuthFlow() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="SignIn" component={SignInScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    </AuthStack.Navigator>
  );
}

export default function AppNavigator() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cloud }}>
        <ActivityIndicator color={colors.go} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {session ? (
        <DataProvider>
          <MainTabs />
        </DataProvider>
      ) : (
        <AuthFlow />
      )}
    </NavigationContainer>
  );
}
