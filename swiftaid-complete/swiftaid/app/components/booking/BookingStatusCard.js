/**
 * BookingStatusCard — shows driver info + ETA on assigned/tracking screens
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { COLORS, RADIUS } from '../../constants';
import { BOOKING_STATUS_LABELS } from '../../constants';

const BookingStatusCard = ({ booking, onCallDriver, onShareTrip }) => {
  if (!booking) return null;
  const { ambulance, status, fare } = booking;

  const callDriver = () => {
    if (ambulance?.driver?.phone) {
      Linking.openURL(`tel:${ambulance.driver.phone}`);
    }
    onCallDriver?.();
  };

  return (
    <View style={styles.container}>
      {/* Status banner */}
      <View style={styles.statusRow}>
        <View style={[styles.statusDot, { backgroundColor: status === 'completed' ? COLORS.success : COLORS.primary }]} />
        <Text style={styles.statusText}>{BOOKING_STATUS_LABELS[status] || status}</Text>
      </View>

      {ambulance && (
        <>
          {/* Driver info */}
          <View style={styles.driverRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {ambulance.driver.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </Text>
            </View>
            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>{ambulance.driver.name}</Text>
              <Text style={styles.driverSub}>{ambulance.type?.toUpperCase()} · {ambulance.vehicleNumber}</Text>
              <Text style={styles.rating}>⭐ {ambulance.driver.rating?.toFixed(1)} ({ambulance.driver.totalRides} rides)</Text>
            </View>
            <TouchableOpacity style={styles.callBtn} onPress={callDriver}>
              <Text style={{ fontSize: 20 }}>📞</Text>
            </TouchableOpacity>
          </View>

          {/* Actions row */}
          {onShareTrip && (
            <TouchableOpacity style={styles.shareBtn} onPress={onShareTrip}>
              <Text style={styles.shareBtnText}>📤 Share trip with emergency contact</Text>
            </TouchableOpacity>
          )}
        </>
      )}

      {/* Fare summary */}
      {fare && (
        <View style={styles.fareRow}>
          <Text style={styles.fareLabel}>Estimated fare</Text>
          <Text style={styles.fareAmount}>Rs. {fare.total?.toLocaleString()}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background, borderRadius: RADIUS.xl,
    padding: 16, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.06, shadowRadius: 12,
    elevation: 8,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusText: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  driverRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  driverInfo: { flex: 1 },
  driverName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  driverSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  rating: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  callBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.successBg, alignItems: 'center', justifyContent: 'center',
  },
  shareBtn: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: 12, alignItems: 'center',
  },
  shareBtnText: { fontSize: 13, color: COLORS.secondary, fontWeight: '500' },
  fareRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  fareLabel: { fontSize: 13, color: COLORS.textSecondary },
  fareAmount: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
});

export default BookingStatusCard;
