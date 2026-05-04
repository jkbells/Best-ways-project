/**
 * AppNavigator
 * Root navigation: Auth stack → Main tab navigator → Booking stack
 */

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';

// Screens
import SplashScreen        from '../screens/SplashScreen';
import LoginScreen         from '../screens/LoginScreen';
import OTPVerificationScreen from '../screens/OTPVerificationScreen';
import ProfileSetupScreen  from '../screens/ProfileSetupScreen';
import HomeScreen          from '../screens/HomeScreen';
import HistoryScreen       from '../screens/HistoryScreen';
import ProfileScreen       from '../screens/ProfileScreen';
import LocationPickerScreen    from '../screens/LocationPickerScreen';
import AmbulanceSelectionScreen from '../screens/AmbulanceSelectionScreen';
import PatientDetailsScreen    from '../screens/PatientDetailsScreen';
import ConfirmBookingScreen    from '../screens/ConfirmBookingScreen';
import TrackingScreen          from '../screens/TrackingScreen';
import CompletionScreen        from '../screens/CompletionScreen';
import RatingScreen            from '../screens/RatingScreen';

import { COLORS } from '../constants';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

// ─── Tab icon component ──────────────────────────────────────────────────────
const TabIcon = ({ emoji, label, focused }) => (
  <View style={tabStyles.tab}>
    <Text style={[tabStyles.emoji, !focused && { opacity: 0.5 }]}>{emoji}</Text>
    <Text style={[tabStyles.label, focused && { color: COLORS.primary }]}>{label}</Text>
  </View>
);

// ─── Main tab navigator ──────────────────────────────────────────────────────
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: { height: 60, borderTopColor: '#F0F0F0', paddingTop: 4 },
      tabBarShowLabel: false,
    }}
  >
    <Tab.Screen
      name="HomeTab"
      component={HomeScreen}
      options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Home" focused={focused} /> }}
    />
    <Tab.Screen
      name="HistoryTab"
      component={HistoryScreen}
      options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📋" label="History" focused={focused} /> }}
    />
    <Tab.Screen
      name="ProfileTab"
      component={ProfileScreen}
      options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Profile" focused={focused} /> }}
    />
  </Tab.Navigator>
);

// ─── Root navigator ──────────────────────────────────────────────────────────
const AppNavigator = () => {
  const { isAuthenticated, initialized } = useSelector(state => state.auth);

  if (!initialized) {
    // Show loading while checking stored token
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0D47A1' }}>
        <Text style={{ fontSize: 40, marginBottom: 20 }}>🚑</Text>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          // Auth flow
          <>
            <Stack.Screen name="Splash"           component={SplashScreen} />
            <Stack.Screen name="Login"            component={LoginScreen} />
            <Stack.Screen name="OTPVerification"  component={OTPVerificationScreen} />
            <Stack.Screen name="ProfileSetup"     component={ProfileSetupScreen} />
          </>
        ) : (
          // App flow
          <>
            <Stack.Screen name="MainTabs"      component={MainTabs} />
            {/* Booking stack — slides up from bottom */}
            <Stack.Screen name="LocationPickerScreen"    component={LocationPickerScreen}
              options={{ presentation: 'modal' }} />
            <Stack.Screen name="AmbulanceSelectionScreen" component={AmbulanceSelectionScreen} />
            <Stack.Screen name="PatientDetailsScreen"    component={PatientDetailsScreen} />
            <Stack.Screen name="ConfirmBookingScreen"    component={ConfirmBookingScreen} />
            <Stack.Screen name="TrackingScreen"          component={TrackingScreen}
              options={{ gestureEnabled: false }} />
            <Stack.Screen name="CompletionScreen"        component={CompletionScreen}
              options={{ gestureEnabled: false }} />
            <Stack.Screen name="RatingScreen"            component={RatingScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const tabStyles = StyleSheet.create({
  tab: { alignItems: 'center', gap: 2 },
  emoji: { fontSize: 22 },
  label: { fontSize: 10, color: '#999', fontWeight: '500' },
});

export default AppNavigator;
