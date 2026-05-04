/**
 * Home Screen — Map view with nearby ambulances and booking entry
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Platform, Alert, Dimensions, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNearbyAmbulances } from '../store/slices/ambulanceSlice';
import { setFormPickup, createEmergencyBooking } from '../store/slices/bookingSlice';
import { connectUserSocket } from '../services/socketService';
import Button from '../components/common/Button';
import { COLORS, RADIUS, AMBULANCE_TYPES } from '../constants';

const { height } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { nearby, loading: ambLoading } = useSelector(state => state.ambulance);
  const { loading: bookingLoading } = useSelector(state => state.booking);

  const mapRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(false);

  // ─── Permissions & Location ───────────────────────────────────────────────
  const requestLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError(true);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      setUserLocation(coords);

      // Save as default pickup
      const [address] = await Location.reverseGeocodeAsync(coords);
      dispatch(setFormPickup({
        ...coords,
        address: address
          ? `${address.street || ''}, ${address.city || address.region || ''}`.trim()
          : 'Current Location',
      }));

      // Fetch nearby ambulances
      dispatch(fetchNearbyAmbulances(coords));

      // Animate map to user
      mapRef.current?.animateToRegion({
        ...coords, latitudeDelta: 0.05, longitudeDelta: 0.05,
      }, 1000);
    } catch (err) {
      console.error('Location error:', err);
      setLocationError(true);
    }
  }, [dispatch]);

  useEffect(() => {
    requestLocation();
    connectUserSocket(); // Connect socket on home screen load
  }, []);

  // ─── Emergency SOS Handler ────────────────────────────────────────────────
  const handleEmergency = () => {
    if (!userLocation) {
      Alert.alert('Location Required', 'Please enable location to use emergency booking.');
      return;
    }
    Alert.alert(
      '🚨 Emergency SOS',
      'This will instantly dispatch the nearest ambulance to your current location. Confirm?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Dispatch Now!',
          style: 'destructive',
          onPress: async () => {
            const result = await dispatch(createEmergencyBooking(userLocation));
            if (createEmergencyBooking.fulfilled.match(result)) {
              navigation.navigate('BookingStack', {
                screen: 'TrackingScreen',
                params: { bookingId: result.payload._id },
              });
            } else {
              Alert.alert('Error', result.payload || 'Failed to dispatch. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* ─── Map ─────────────────────────────────────────────────────────── */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        showsUserLocation
        showsMyLocationButton={false}
        initialRegion={{
          latitude: userLocation?.latitude ?? 32.9425,
          longitude: userLocation?.longitude ?? 73.7257,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        }}
      >
        {/* Ambulance markers */}
        {nearby.map(amb => {
          const coords = amb.currentLocation?.coordinates;
          if (!coords) return null;
          return (
            <Marker
              key={amb._id}
              coordinate={{ latitude: coords[1], longitude: coords[0] }}
              title={`${amb.driver.name}`}
              description={`${AMBULANCE_TYPES[amb.type]?.label} · ${amb.etaMinutes} min`}
            >
              <View style={styles.ambMarker}>
                <Text style={{ fontSize: 20 }}>🚑</Text>
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* ─── Top Bar ─────────────────────────────────────────────────────── */}
      <SafeAreaView style={styles.topBar} edges={['top']}>
        <View style={styles.topRow}>
          <TouchableOpacity
            style={styles.searchBar}
            onPress={() => navigation.navigate('BookingStack', { screen: 'LocationPickerScreen' })}
          >
            <Text style={{ fontSize: 16 }}>🔍</Text>
            <Text style={styles.searchPlaceholder}>Where do you need help?</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileBtn}
            onPress={() => navigation.navigate('ProfileTab')}>
            <Text style={styles.profileInitial}>
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Ambulance count badge */}
        {nearby.length > 0 && (
          <View style={styles.nearbyBadge}>
            <Text style={styles.nearbyText}>🚑 {nearby.length} ambulances nearby</Text>
          </View>
        )}
      </SafeAreaView>

      {/* ─── Recenter Button ─────────────────────────────────────────────── */}
      <TouchableOpacity style={styles.recenterBtn} onPress={requestLocation}>
        <Text style={{ fontSize: 18 }}>📍</Text>
      </TouchableOpacity>

      {/* ─── Bottom Panel ────────────────────────────────────────────────── */}
      <View style={styles.bottomPanel}>
        {/* Emergency SOS */}
        <TouchableOpacity
          style={styles.sosBtn}
          onPress={handleEmergency}
          disabled={bookingLoading}
        >
          <View style={styles.sosBtnInner}>
            <Text style={styles.sosIcon}>🚨</Text>
            <View>
              <Text style={styles.sosTitle}>Emergency SOS</Text>
              <Text style={styles.sosSub}>One tap — nearest ambulance dispatched</Text>
            </View>
          </View>
          {bookingLoading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.sosArrow}>›</Text>
          }
        </TouchableOpacity>

        {/* Ambulance type quick select */}
        <Text style={styles.sectionLabel}>BOOK AN AMBULANCE</Text>
        <View style={styles.typeGrid}>
          {Object.entries(AMBULANCE_TYPES).map(([key, config]) => (
            <TouchableOpacity
              key={key}
              style={styles.typeChip}
              onPress={() => navigation.navigate('BookingStack', {
                screen: 'LocationPickerScreen',
                params: { preselectedType: key },
              })}
            >
              <Text style={styles.typeEmoji}>🚑</Text>
              <Text style={styles.typeLabel} numberOfLines={2}>{config.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 16 },
  topRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8,
    elevation: 4,
  },
  searchPlaceholder: { fontSize: 15, color: COLORS.textMuted },
  profileBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6,
    elevation: 4,
  },
  profileInitial: { color: '#fff', fontSize: 16, fontWeight: '700' },
  nearbyBadge: {
    alignSelf: 'flex-start', backgroundColor: '#fff', borderRadius: RADIUS.full,
    paddingHorizontal: 12, paddingVertical: 6, marginTop: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4,
    elevation: 2,
  },
  nearbyText: { fontSize: 12, fontWeight: '600', color: COLORS.secondary },
  recenterBtn: {
    position: 'absolute', right: 16, bottom: 280,
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 8,
    elevation: 4,
  },
  ambMarker: {
    backgroundColor: '#fff', borderRadius: 20, padding: 4,
    borderWidth: 2, borderColor: COLORS.primary,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4,
    elevation: 4,
  },
  bottomPanel: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.06, shadowRadius: 12,
    elevation: 12,
  },
  panelHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#E0E0E0', alignSelf: 'center', marginBottom: 14 },
  sosBtn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.lg,
    padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 16, marginTop: 8,
  },
  sosBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sosIcon: { fontSize: 28 },
  sosTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  sosSub: { color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 2 },
  sosArrow: { color: 'rgba(255,255,255,0.7)', fontSize: 24, fontWeight: '300' },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 0.8, marginBottom: 10 },
  typeGrid: { flexDirection: 'row', gap: 8 },
  typeChip: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: 10, alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: COLORS.border,
  },
  typeEmoji: { fontSize: 20 },
  typeLabel: { fontSize: 10, fontWeight: '600', color: COLORS.text, textAlign: 'center' },
});

export default HomeScreen;
