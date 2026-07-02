import { StatusBar } from 'expo-status-bar';
import React from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import { WeatherProvider } from './context/WeatherContext';
import HomeScreen from './screens/HomeScreen';

export default function App() {
  return (
    <ErrorBoundary>
      <WeatherProvider>
        <HomeScreen />
        <StatusBar style="light" />
      </WeatherProvider>
    </ErrorBoundary>
  );
}
