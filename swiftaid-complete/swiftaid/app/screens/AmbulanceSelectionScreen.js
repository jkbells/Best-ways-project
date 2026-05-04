/**
 * AmbulanceSelectionScreen
 * Shows ambulance types with pricing, ETA, and features
 */

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNearbyAmbulances } from '../store/slices/ambulanceSlice';
import { setFormAmbulanceType } from '../store/slices/bookingSlice';
import AmbulanceTypeCard from '../components/booking/AmbulanceTypeCard';
import Button from '../components/common/Button';
import { COLORS, RADIUS, AMBULANCE_TYPES } from '../constants';
import { haversineDistance, formatDistance, formatCurrency } from '../utils';

const AmbulanceSelectionScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { form } = useSelector(state => state.booking);
  const { nearby, loading } = useSelector(state => state.ambulance);
  const preselectedType = route.params?.preselectedType || 'basic';

  const [selectedType, setSelectedType] = useState(preselectedType);

  // Calculate trip distance
  const distanceKm = form.pickup && form.destination
    ? haversineDistance(
        form.pickup.latitude, form.pickup.longitude,
        form.destination.latitude, form.destination.longitude
      ).toFixed(1)
    : null;

  useEffect(() => {
    if (form.pickup) {
      dispatch(fetchNearbyAmbulances({ latitude: form.pickup.latitude, longitude: form.pickup.longitude }));
    }
  }, []);

  // Get ETA for each type from nearby ambulances
  const getETA = (type) => {
    const amb = nearby.find(a => a.type === type);
    return amb ? amb.etaMinutes : null;
  };

  const handleContinue = () => {
    dispatch(setFormAmbulanceType(selectedType));
    navigation.navigate('PatientDetailsScreen');
  };

  const config = AMBULANCE_TYPES[selectedType];
  const estimatedFare = distanceKm
    ? Math.round(config.baseFare + distanceKm * config.perKm)
    : config.baseFare;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ fontSize: 22 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choose Ambulance</Text>
      </View>

      {/* Trip summary */}
      {form.pickup && form.destination && (
        <View style={styles.tripSummary}>
          <Text style={styles.tripText} numberOfLines={1}>
            📍 {form.pickup.address}
          </Text>
          <Text style={styles.tripArrow}>↓</Text>
          <Text style={styles.tripText} numberOfLines={1}>
            🏥 {form.destination.address}
          </Text>
          {distanceKm && (
            <View style={styles.distBadge}>
              <Text style={styles.distText}>{formatDistance(parseFloat(distanceKm))}</Text>
            </View>
          )}
        </View>
      )}

      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loadingText}>Finding available ambulances...</Text>
        </View>
      )}

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {Object.keys(AMBULANCE_TYPES).map(type => (
          <AmbulanceTypeCard
            key={type}
            type={type}
            isSelected={selectedType === type}
            onSelect={setSelectedType}
            etaMinutes={getETA(type)}
          />
        ))}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <View style={styles.priceRow}>
          <View>
            <Text style={styles.priceLabel}>Estimated fare</Text>
            <Text style={styles.priceValue}>{formatCurrency(estimatedFare)}+</Text>
          </View>
          {distanceKm && (
            <Text style={styles.distLabel}>{formatDistance(parseFloat(distanceKm))}</Text>
          )}
        </View>
        <Button title={`Continue with ${AMBULANCE_TYPES[selectedType].label}`} onPress={handleContinue} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  tripSummary: {
    marginHorizontal: 16, marginTop: 12, backgroundColor: '#FFF8F8',
    borderRadius: RADIUS.lg, padding: 14, borderWidth: 1, borderColor: '#FFE0E0',
  },
  tripText: { fontSize: 13, color: COLORS.text, fontWeight: '500' },
  tripArrow: { color: COLORS.textMuted, marginLeft: 4, marginVertical: 2 },
  distBadge: {
    alignSelf: 'flex-start', backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 4, marginTop: 8,
  },
  distText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 10 },
  loadingText: { fontSize: 13, color: COLORS.textSecondary },
  scroll: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  bottomBar: {
    padding: 20, paddingBottom: 28, borderTopWidth: 1, borderTopColor: COLORS.border,
    backgroundColor: COLORS.background, gap: 12,
  },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceLabel: { fontSize: 12, color: COLORS.textSecondary },
  priceValue: { fontSize: 20, fontWeight: '800', color: COLORS.primary, marginTop: 2 },
  distLabel: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '500' },
});

export default AmbulanceSelectionScreen;
