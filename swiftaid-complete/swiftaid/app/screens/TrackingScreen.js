/**
 * TrackingScreen
 * Live map tracking + booking status + driver info
 * Socket.io updates driver location in real time
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert, Animated, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBooking, updateStatus, updateDriverLocation, updateCurrentBookingStatus } from '../store/slices/bookingSlice';
import {
  joinBookingRoom, leaveBookingRoom,
  onDriverLocation, offDriverLocation,
  onBookingStatusUpdate, offBookingStatusUpdate,
} from '../services/socketService';
import BookingStatusCard from '../components/booking/BookingStatusCard';
import { COLORS, RADIUS, BOOKING_STATUS_LABELS } from '../constants';
import { formatCurrency } from '../utils';

const STATUS_STEPS = [
  { key: 'searching',   label: 'Booking confirmed' },
  { key: 'accepted',    label: 'Ambulance assigned' },
  { key: 'arriving',    label: 'Driver on the way' },
  { key: 'arrived',     label: 'Ambulance arrived' },
  { key: 'in_progress', label: 'Trip in progress' },
  { key: 'completed',   label: 'Arrived at hospital' },
];

const STATUS_ORDER = STATUS_STEPS.map(s => s.key);

const TrackingScreen = ({ route, navigation }) => {
  const { bookingId } = route.params;
  const dispatch = useDispatch();
  const { current: booking, driverLocation } = useSelector(state => state.booking);
  const { user } = useSelector(state => state.auth);

  const mapRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [etaSeconds, setEtaSeconds] = useState(null);

  // ─── Pulse animation for searching state ─────────────────────────────────
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.4, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,   duration: 700, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // ─── Load booking + socket setup ─────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchBooking(bookingId));
    joinBookingRoom(bookingId);

    onDriverLocation((data) => {
      dispatch(updateDriverLocation({ latitude: data.latitude, longitude: data.longitude }));
      // Pan map to driver location
      mapRef.current?.animateToRegion({
        latitude: data.latitude, longitude: data.longitude,
        latitudeDelta: 0.02, longitudeDelta: 0.02,
      }, 500);
    });

    onBookingStatusUpdate((data) => {
      dispatch(updateCurrentBookingStatus({ status: data.status }));
      if (data.status === 'completed') {
        navigation.replace('CompletionScreen', { bookingId });
      }
    });

    // Simulate driver movement for demo (remove in production with real drivers)
    simulateDriverMovement();

    return () => {
      leaveBookingRoom(bookingId);
      offDriverLocation();
      offBookingStatusUpdate();
    };
  }, [bookingId]);

  // Mock driver movement simulation (dev only)
  const simulateDriverMovement = () => {
    if (!booking?.pickup) return;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      const lat = (booking.pickup?.latitude ?? 32.94) - step * 0.001;
      const lon = (booking.pickup?.longitude ?? 73.72) + step * 0.0005;
      dispatch(updateDriverLocation({ latitude: lat, longitude: lon }));
      if (step >= 20) clearInterval(interval);
    }, 3000);
  };

  const handleCancel = () => {
    Alert.alert('Cancel Booking', 'Are you sure you want to cancel?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          await dispatch(updateStatus({ bookingId, status: 'cancelled' }));
          navigation.replace('MainTabs');
        },
      },
    ]);
  };

  if (!booking) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.searchingContainer}>
          <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseAnim }] }]} />
          <View style={styles.pulseCore}><Text style={styles.plusIcon}>+</Text></View>
          <Text style={styles.searchingText}>Searching for ambulance...</Text>
          <Text style={styles.searchingSub}>Finding the nearest available unit</Text>
        </View>
      </SafeAreaView>
    );
  }

  const ambulance = booking.ambulance;
  const pickupCoords = booking.pickup
    ? { latitude: booking.pickup.latitude, longitude: booking.pickup.longitude }
    : null;
  const destCoords = booking.destination
    ? { latitude: booking.destination.latitude, longitude: booking.destination.longitude }
    : null;

  const currentStatusIdx = STATUS_ORDER.indexOf(booking.status);

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: pickupCoords?.latitude ?? 32.94,
          longitude: pickupCoords?.longitude ?? 73.72,
          latitudeDelta: 0.04, longitudeDelta: 0.04,
        }}
      >
        {/* User pickup marker */}
        {pickupCoords && (
          <Marker coordinate={pickupCoords} title="Pickup" pinColor={COLORS.secondary} />
        )}
        {/* Hospital destination marker */}
        {destCoords && (
          <Marker coordinate={destCoords} title="Hospital" pinColor={COLORS.primary} />
        )}
        {/* Live driver marker */}
        {driverLocation && (
          <Marker coordinate={driverLocation} title="Ambulance">
            <View style={styles.driverMarker}><Text style={{ fontSize: 22 }}>🚑</Text></View>
          </Marker>
        )}
        {/* Route line */}
        {pickupCoords && destCoords && (
          <Polyline
            coordinates={[driverLocation || pickupCoords, destCoords]}
            strokeColor={COLORS.secondary}
            strokeWidth={3}
            lineDashPattern={[8, 4]}
          />
        )}
      </MapView>

      {/* ETA badge on map */}
      {booking.estimatedDurationMin && (
        <View style={styles.etaBadge}>
          <Text style={styles.etaLabel}>ETA</Text>
          <Text style={styles.etaValue}>{booking.estimatedDurationMin} min</Text>
        </View>
      )}

      {/* Bottom panel */}
      <View style={styles.bottomPanel}>
        <View style={styles.handle} />

        {/* No driver state */}
        {booking.status === 'no_drivers' && (
          <View style={styles.noDriverBox}>
            <Text style={styles.noDriverTitle}>⚠️ No ambulances available</Text>
            <Text style={styles.noDriverSub}>Please call 115 (Emergency) or try again</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => navigation.replace('HomeScreen')}>
              <Text style={styles.retryBtnText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Driver info */}
        {ambulance && <BookingStatusCard booking={booking} />}

        {/* Status steps */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 14 }}>
          <View style={styles.stepsRow}>
            {STATUS_STEPS.map((step, i) => {
              const done = i < currentStatusIdx;
              const active = i === currentStatusIdx;
              return (
                <View key={step.key} style={styles.step}>
                  <View style={[
                    styles.stepDot,
                    done && styles.stepDotDone,
                    active && styles.stepDotActive,
                  ]}>
                    {done && <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>✓</Text>}
                    {active && <View style={styles.stepDotInner} />}
                  </View>
                  {i < STATUS_STEPS.length - 1 && (
                    <View style={[styles.stepLine, done && styles.stepLineDone]} />
                  )}
                  <Text style={[styles.stepLabel, (done || active) && { color: COLORS.text }]}>
                    {step.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* Cancel button (only before trip starts) */}
        {['searching', 'accepted', 'arriving'].includes(booking.status) && (
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
            <Text style={styles.cancelBtnText}>Cancel Booking</Text>
          </TouchableOpacity>
        )}

        {/* Mark arrived (dev shortcut) */}
        {booking.status === 'in_progress' && (
          <TouchableOpacity
            style={styles.completeBtn}
            onPress={async () => {
              await dispatch(updateStatus({ bookingId, status: 'completed' }));
              navigation.replace('CompletionScreen', { bookingId });
            }}
          >
            <Text style={styles.completeBtnText}>Mark as Completed</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  searchingContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16,
  },
  pulseRing: {
    position: 'absolute', width: 120, height: 120, borderRadius: 60,
    backgroundColor: `${COLORS.primary}20`,
  },
  pulseCore: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  plusIcon: { color: '#fff', fontSize: 32, fontWeight: '900' },
  searchingText: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginTop: 20 },
  searchingSub: { fontSize: 14, color: COLORS.textSecondary },
  etaBadge: {
    position: 'absolute', top: 60, left: 16,
    backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 4,
  },
  etaLabel: { fontSize: 11, color: COLORS.textMuted },
  etaValue: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
  driverMarker: {
    backgroundColor: '#fff', borderRadius: 20, padding: 4,
    borderWidth: 2, borderColor: COLORS.primary,
  },
  bottomPanel: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 16, paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    maxHeight: '55%',
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 12,
    elevation: 12,
  },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#E0E0E0', alignSelf: 'center', marginBottom: 12 },
  noDriverBox: { padding: 16, backgroundColor: COLORS.warningBg, borderRadius: RADIUS.lg, gap: 8, marginBottom: 12 },
  noDriverTitle: { fontSize: 16, fontWeight: '700', color: COLORS.warning },
  noDriverSub: { fontSize: 13, color: COLORS.textSecondary },
  retryBtn: { backgroundColor: COLORS.warning, borderRadius: RADIUS.md, padding: 12, alignItems: 'center', marginTop: 4 },
  retryBtnText: { color: '#fff', fontWeight: '700' },
  stepsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 0, paddingHorizontal: 4 },
  step: { alignItems: 'center', width: 80 },
  stepDot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: COLORS.border, alignItems: 'center', justifyContent: 'center',
  },
  stepDotDone: { backgroundColor: COLORS.primary },
  stepDotActive: { backgroundColor: COLORS.primary, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 6, elevation: 4 },
  stepDotInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#fff' },
  stepLine: { position: 'absolute', top: 14, left: '50%', width: 80, height: 2, backgroundColor: COLORS.border },
  stepLineDone: { backgroundColor: COLORS.primary },
  stepLabel: { fontSize: 10, color: COLORS.textMuted, textAlign: 'center', marginTop: 6, lineHeight: 14 },
  cancelBtn: {
    marginTop: 12, padding: 14, borderRadius: RADIUS.lg,
    borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center',
  },
  cancelBtnText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '500' },
  completeBtn: {
    marginTop: 12, padding: 14, borderRadius: RADIUS.lg,
    backgroundColor: COLORS.successBg, alignItems: 'center',
  },
  completeBtnText: { fontSize: 14, color: COLORS.success, fontWeight: '700' },
});

export default TrackingScreen;
