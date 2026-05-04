/**
 * ConfirmBookingScreen
 * Shows full fare breakdown, payment selector, confirm button
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { createBooking, setFormPayment } from '../store/slices/bookingSlice';
import Button from '../components/common/Button';
import LoadingOverlay from '../components/common/LoadingOverlay';
import { COLORS, RADIUS, AMBULANCE_TYPES } from '../constants';
import { formatCurrency, haversineDistance } from '../utils';

const PAYMENT_METHODS = [
  { key: 'cash',      label: 'Cash',      icon: '💵' },
  { key: 'card',      label: 'Card',      icon: '💳' },
  { key: 'easypaisa', label: 'Easypaisa', icon: '🟢' },
  { key: 'jazzcash',  label: 'JazzCash',  icon: '🔴' },
];

const ConfirmBookingScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { form, loading } = useSelector(state => state.booking);
  const [paymentMethod, setPaymentMethod] = useState(form.paymentMethod || 'cash');

  const typeConfig = AMBULANCE_TYPES[form.ambulanceType];
  const distanceKm = form.pickup && form.destination
    ? parseFloat(haversineDistance(
        form.pickup.latitude, form.pickup.longitude,
        form.destination.latitude, form.destination.longitude
      ).toFixed(2))
    : 1;

  const baseFare        = typeConfig.baseFare;
  const distCharge      = Math.round(distanceKm * typeConfig.perKm);
  const equipCharge     = 90;
  const total           = baseFare + distCharge + equipCharge;
  const etaMin          = Math.round(distanceKm * 2.5);

  const handleConfirm = async () => {
    dispatch(setFormPayment(paymentMethod));
    const result = await dispatch(createBooking({
      pickup: form.pickup,
      destination: form.destination,
      ambulanceType: form.ambulanceType,
      patient: form.patient,
      paymentMethod,
    }));

    if (createBooking.fulfilled.match(result)) {
      navigation.replace('TrackingScreen', { bookingId: result.payload._id });
    } else {
      Alert.alert('Booking Failed', result.payload || 'Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LoadingOverlay visible={loading} message="Finding your ambulance..." />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ fontSize: 22 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Booking</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Trip summary card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>TRIP SUMMARY</Text>
          <View style={styles.tripRow}>
            <View style={[styles.tripDot, { backgroundColor: COLORS.secondary }]} />
            <View style={styles.tripInfo}>
              <Text style={styles.tripLabel}>Pickup</Text>
              <Text style={styles.tripAddr} numberOfLines={2}>{form.pickup?.address}</Text>
            </View>
          </View>
          <View style={styles.dottedLine} />
          <View style={styles.tripRow}>
            <View style={[styles.tripDot, { backgroundColor: COLORS.primary }]} />
            <View style={styles.tripInfo}>
              <Text style={styles.tripLabel}>Destination</Text>
              <Text style={styles.tripAddr} numberOfLines={2}>{form.destination?.address}</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statVal}>{distanceKm} km</Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statVal}>~{etaMin} min</Text>
              <Text style={styles.statLabel}>ETA</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={[styles.statVal, { color: typeConfig.color }]}>{typeConfig.label.split(' ')[0]}</Text>
              <Text style={styles.statLabel}>Type</Text>
            </View>
          </View>
        </View>

        {/* Patient card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>PATIENT</Text>
          <Text style={styles.patientName}>{form.patient.name}</Text>
          <View style={styles.condBadge}>
            <Text style={[styles.condText, {
              color: form.patient.condition === 'critical' ? COLORS.error
                   : form.patient.condition === 'moderate' ? COLORS.warning : COLORS.success
            }]}>
              {form.patient.condition?.toUpperCase()}
            </Text>
          </View>
          {form.patient.notes ? (
            <Text style={styles.patientNotes}>📝 {form.patient.notes}</Text>
          ) : null}
        </View>

        {/* Fare breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>FARE BREAKDOWN</Text>
          <View style={styles.fareRow}><Text style={styles.fareKey}>Base fare</Text><Text style={styles.fareVal}>{formatCurrency(baseFare)}</Text></View>
          <View style={styles.fareRow}><Text style={styles.fareKey}>Distance ({distanceKm} km)</Text><Text style={styles.fareVal}>{formatCurrency(distCharge)}</Text></View>
          <View style={styles.fareRow}><Text style={styles.fareKey}>Equipment charge</Text><Text style={styles.fareVal}>{formatCurrency(equipCharge)}</Text></View>
          <View style={styles.fareDivider} />
          <View style={styles.fareRow}>
            <Text style={styles.fareTotal}>Total Estimate</Text>
            <Text style={[styles.fareTotal, { color: COLORS.primary }]}>{formatCurrency(total)}</Text>
          </View>
          <Text style={styles.fareNote}>* Final fare may vary by actual distance</Text>
        </View>

        {/* Payment method */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>PAYMENT METHOD</Text>
          <View style={styles.payGrid}>
            {PAYMENT_METHODS.map(m => (
              <TouchableOpacity
                key={m.key}
                style={[styles.payBtn, paymentMethod === m.key && styles.payBtnActive]}
                onPress={() => setPaymentMethod(m.key)}
              >
                <Text style={{ fontSize: 22 }}>{m.icon}</Text>
                <Text style={[styles.payLabel, paymentMethod === m.key && { color: COLORS.primary }]}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 16 }} />
        <Button
          title={`Confirm — ${formatCurrency(total)}`}
          onPress={handleConfirm}
          loading={loading}
        />
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12, backgroundColor: COLORS.background, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  scroll: { padding: 16, gap: 12 },
  card: { backgroundColor: COLORS.background, borderRadius: RADIUS.lg, padding: 16 },
  cardTitle: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 0.5, marginBottom: 14 },
  tripRow: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  tripDot: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
  tripInfo: { flex: 1 },
  tripLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },
  tripAddr: { fontSize: 14, fontWeight: '500', color: COLORS.text, marginTop: 2 },
  dottedLine: { width: 2, height: 18, backgroundColor: '#DDD', marginLeft: 5, marginVertical: 4 },
  statsRow: { flexDirection: 'row', marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: COLORS.border },
  stat: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  statLabel: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: COLORS.border },
  patientName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  condBadge: { marginTop: 6 },
  condText: { fontSize: 12, fontWeight: '700' },
  patientNotes: { fontSize: 13, color: COLORS.textSecondary, marginTop: 8 },
  fareRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  fareKey: { fontSize: 14, color: COLORS.textSecondary },
  fareVal: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  fareDivider: { height: 1, backgroundColor: '#DDD', marginVertical: 4 },
  fareTotal: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  fareNote: { fontSize: 11, color: COLORS.textMuted, marginTop: 8 },
  payGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  payBtn: {
    width: '47%', padding: 14, borderRadius: RADIUS.md,
    alignItems: 'center', gap: 6,
    borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.surface,
  },
  payBtnActive: { borderColor: COLORS.primary, backgroundColor: '#FFF8F8' },
  payLabel: { fontSize: 13, fontWeight: '600', color: COLORS.text },
});

export default ConfirmBookingScreen;
