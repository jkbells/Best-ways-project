/**
 * SwiftAid — Root App Component
 * Initializes Redux store, loads auth state, renders navigator
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider, useDispatch } from 'react-redux';
import Toast from 'react-native-toast-message';
import { store } from './store';
import AppNavigator from './navigation/AppNavigator';
import { loadCurrentUser } from './store/slices/authSlice';

// Inner component — accesses Redux store
const AppContent = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check for stored JWT token on app launch
    dispatch(loadCurrentUser());
  }, []);

  return (
    <>
      <StatusBar style="auto" />
      <AppNavigator />
      <Toast />
    </>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </Provider>
  );
}
