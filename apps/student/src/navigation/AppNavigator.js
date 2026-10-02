import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { BookingProvider } from '../context/BookingContext';

import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import HomeScreen from '../screens/HomeScreen';
import InstructorsScreen from '../screens/InstructorsScreen';
import BookLessonScreen from '../screens/BookLessonScreen';
import MyLessonsScreen from '../screens/MyLessonsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const AuthStack = createNativeStackNavigator();

const ICONS = {
  Home: 'home',
  Instructors: 'people',
  Book: 'add-circle',
  MyLessons: 'calendar',
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
          <Ionicons name={ICONS[route.name]} size={route.name === 'Book' ? size + 8 : size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Instructors" component={InstructorsScreen} />
      <Tab.Screen name="Book" component={BookLessonScreen} options={{ title: 'Book' }} />
      <Tab.Screen name="MyLessons" component={MyLessonsScreen} options={{ title: 'My Lessons' }} />
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
        <BookingProvider>
          <MainTabs />
        </BookingProvider>
      ) : (
        <AuthFlow />
      )}
    </NavigationContainer>
  );
}
