import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { BookingProvider } from './src/context/BookingContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <BookingProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </BookingProvider>
    </SafeAreaProvider>
  );
}
