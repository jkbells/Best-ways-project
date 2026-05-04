/**
 * CompletionScreen — Trip completed, show receipt
 */

import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import Button from '../components/common/Button';
import { COLORS, RADIUS } from '../constants';
import { formatCurrency, formatDateTime } from '../utils';

const CompletionScreen = ({ route, navigation }) => {
  const { bookingId } = route.params;
  const { current: booking } = useSelector(state => state.booking);

  const fare = booking?.fare;
  const driver = booking?.ambulance?.driver;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Success header */}
        <View style={styles.successHeader}>
          <View style={styles.checkCircle}>
            <Text style={styles.checkMark}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Trip Completed!</Text>
          <Text style={styles.successSub}>
            You arrived safely at {booking?.destination?.address || 'the hospital'}
          </Text>
        </View>

        {/* Receipt card */}
        <View style={styles.card}>
          <View style={styles.receiptHeader}>
            <Text style={styles.cardTitle}>RECEIPT</Text>
            <Text style={styles.bookingRef}>{booking?.bookingRef || ''}</Text>
          </View>

          {[
            ['Date & Time', booking?.timeline?.completedAt ? formatDateTime(booking.timeline.completedAt) : '—'],
            ['Driver', driver?.name || '—'],
            ['Vehicle', booking?.ambulance?.vehicleNumber || '—'],
            ['Distance', `${booking?.distanceKm || '—'} km`],
            ['Duration', `${booking?.estimatedDurationMin || '—'} min`],
          ].map(([label, value]) => (
            <View key={label} style={styles.receiptRow}>
              <Text style={styles.receiptKey}>{label}</Text>
              <Text style={styles.receiptVal}>{value}</Text>
            </View>
          ))}

          <View style={styles.fareDivider} />

          {fare && (
            <>
              <View style={styles.receiptRow}><Text style={styles.receiptKey}>Base fare</Text><Text style={styles.receiptVal}>{formatCurrency(fare.baseFare)}</Text></View>
              <View style={styles.receiptRow}><Text style={styles.receiptKey}>Distance charge</Text><Text style={styles.receiptVal}>{formatCurrency(fare.distanceCharge)}</Text></View>
              <View style={styles.receiptRow}><Text style={styles.receiptKey}>Equipment</Text><Text style={styles.receiptVal}>{formatCurrency(fare.equipmentCharge)}</Text></View>
              <View style={[styles.receiptRow, styles.totalRow]}>
                <Text style={styles.totalKey}>Total Paid</Text>
                <Text style={styles.totalVal}>{formatCurrency(fare.total)}</Text>
              </View>
            </>
          )}

          <View style={[styles.payBadge, {
            backgroundColor: booking?.payment?.method === 'cash' ? '#F5F5F5' : COLORS.successBg
          }]}>
            <Text style={{ fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' }}>
              {booking?.payment?.method === 'cash' ? '💵 Pay cash to driver' : '✅ Payment confirmed'}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <Button
          title="Rate Your Experience"
          onPress={() => navigation.replace('RatingScreen', { bookingId })}
          style={{ marginBottom: 10 }}
        />
        <Button
          title="Download Receipt"
          variant="outline"
          onPress={() => {}}
          style={{ marginBottom: 10 }}
        />
        <Button
          title="Back to Home"
          variant="ghost"
          onPress={() => navigation.replace('MainTabs')}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  scroll: { padding: 20, gap: 0 },
  successHeader: { alignItems: 'center', paddingVertical: 28 },
  checkCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: COLORS.successBg, alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  checkMark: { fontSize: 32, color: COLORS.success, fontWeight: '900' },
  successTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  successSub: { fontSize: 14, color: COLORS.textSecondary, marginTop: 8, textAlign: 'center' },
  card: { backgroundColor: COLORS.background, borderRadius: RADIUS.lg, padding: 16, marginBottom: 16 },
  receiptHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  cardTitle: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 0.5 },
  bookingRef: { fontSize: 12, fontWeight: '700', color: COLORS.secondary, backgroundColor: '#EEF4FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  receiptKey: { fontSize: 14, color: COLORS.textSecondary },
  receiptVal: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  fareDivider: { height: 2, borderStyle: 'dashed', borderWidth: 1, borderColor: '#E0E0E0', marginVertical: 8 },
  totalRow: { borderBottomWidth: 0, paddingTop: 12 },
  totalKey: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  totalVal: { fontSize: 22, fontWeight: '900', color: COLORS.primary },
  payBadge: { borderRadius: RADIUS.md, padding: 12, alignItems: 'center', marginTop: 12 },
});

export default CompletionScreen;
