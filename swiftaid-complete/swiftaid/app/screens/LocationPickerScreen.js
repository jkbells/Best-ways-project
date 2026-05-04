/**
 * LocationPickerScreen
 * User picks pickup + destination; shows hospital suggestions
 */

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { setFormPickup, setFormDestination } from '../store/slices/bookingSlice';
import { COLORS, RADIUS } from '../constants';

// Mock hospital suggestions (in production: Google Places Autocomplete)
const HOSPITALS = [
  { id: '1', name: 'Jhelum District Hospital',    address: 'Hospital Rd, Jhelum',         distance: '0.8 km', open: true },
  { id: '2', name: 'CMH Jhelum',                  address: 'Cantonment, Jhelum',           distance: '1.4 km', open: true },
  { id: '3', name: 'DHQ Hospital Rawalpindi',      address: 'Murree Rd, Rawalpindi',        distance: '87 km',  open: true },
  { id: '4', name: 'Services Hospital Lahore',     address: 'Jail Rd, Lahore',              distance: '118 km', open: true },
  { id: '5', name: 'Pind Dadan Khan THQ Hospital', address: 'Main Rd, Pind Dadan Khan',     distance: '22 km',  open: false },
];

const LocationPickerScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { form } = useSelector(state => state.booking);
  const { preselectedType } = route.params || {};

  const [destQuery, setDestQuery] = useState('');
  const [filtered, setFiltered] = useState(HOSPITALS);

  useEffect(() => {
    if (!destQuery.trim()) { setFiltered(HOSPITALS); return; }
    const q = destQuery.toLowerCase();
    setFiltered(HOSPITALS.filter(h =>
      h.name.toLowerCase().includes(q) || h.address.toLowerCase().includes(q)
    ));
  }, [destQuery]);

  const selectDestination = (hospital) => {
    // Mock coordinates near Jhelum area per hospital
    const coordMap = {
      '1': { latitude: 32.9380, longitude: 73.7270 },
      '2': { latitude: 32.9310, longitude: 73.7380 },
      '3': { latitude: 33.5977, longitude: 73.0479 },
      '4': { latitude: 31.5204, longitude: 74.3587 },
      '5': { latitude: 32.5900, longitude: 73.1200 },
    };
    dispatch(setFormDestination({
      ...coordMap[hospital.id],
      address: hospital.name,
    }));
    navigation.navigate('AmbulanceSelectionScreen', { preselectedType });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={{ fontSize: 22 }}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Set Location</Text>
        </View>

        {/* Location inputs */}
        <View style={styles.inputsCard}>
          {/* Pickup */}
          <View style={styles.inputRow}>
            <View style={[styles.dot, { backgroundColor: COLORS.secondary }]} />
            <View style={styles.inputField}>
              <Text style={styles.inputLabel}>PICKUP</Text>
              <Text style={styles.inputValue} numberOfLines={1}>
                {form.pickup?.address || 'Detecting location...'}
              </Text>
            </View>
          </View>
          <View style={styles.dotLine} />
          {/* Destination */}
          <View style={styles.inputRow}>
            <View style={[styles.dot, { backgroundColor: COLORS.primary }]} />
            <View style={styles.inputField}>
              <Text style={styles.inputLabel}>DESTINATION</Text>
              <TextInput
                style={styles.destInput}
                placeholder="Search hospital or address..."
                placeholderTextColor={COLORS.textMuted}
                value={destQuery}
                onChangeText={setDestQuery}
                autoFocus
              />
            </View>
          </View>
        </View>

        {/* Nearest hospital pill */}
        <TouchableOpacity
          style={styles.nearestPill}
          onPress={() => selectDestination(HOSPITALS[0])}
        >
          <Text style={styles.nearestText}>📍 Nearest: {HOSPITALS[0].name} ({HOSPITALS[0].distance})</Text>
        </TouchableOpacity>

        {/* Hospital list */}
        <Text style={styles.sectionLabel}>HOSPITALS</Text>
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.hospitalItem} onPress={() => selectDestination(item)}>
              <View style={styles.hIcon}>
                <Text style={{ fontSize: 16 }}>🏥</Text>
              </View>
              <View style={styles.hInfo}>
                <Text style={styles.hName}>{item.name}</Text>
                <Text style={styles.hAddr}>{item.address}</Text>
              </View>
              <View style={styles.hRight}>
                <Text style={styles.hDist}>{item.distance}</Text>
                <View style={[styles.statusPill, { backgroundColor: item.open ? COLORS.successBg : COLORS.errorBg }]}>
                  <Text style={[styles.statusText, { color: item.open ? COLORS.success : COLORS.error }]}>
                    {item.open ? '24/7' : 'Closed'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: COLORS.border, marginLeft: 68 }} />}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  inputsCard: {
    marginHorizontal: 16, backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg, padding: 16,
    borderWidth: 1, borderColor: COLORS.border,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  dotLine: { width: 2, height: 20, backgroundColor: '#DDD', marginLeft: 5, marginVertical: 4 },
  inputField: { flex: 1 },
  inputLabel: { fontSize: 10, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 0.5 },
  inputValue: { fontSize: 14, fontWeight: '500', color: COLORS.text, marginTop: 2 },
  destInput: { fontSize: 14, color: COLORS.text, marginTop: 2, padding: 0 },
  nearestPill: {
    marginHorizontal: 16, marginTop: 12, backgroundColor: '#EEF4FF',
    borderRadius: RADIUS.full, paddingHorizontal: 14, paddingVertical: 10,
  },
  nearestText: { fontSize: 13, color: COLORS.secondary, fontWeight: '500' },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: COLORS.textMuted,
    letterSpacing: 0.8, paddingHorizontal: 20, marginTop: 20, marginBottom: 8,
  },
  hospitalItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 20, paddingVertical: 14,
  },
  hIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#FFF0F0', alignItems: 'center', justifyContent: 'center',
  },
  hInfo: { flex: 1 },
  hName: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  hAddr: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  hRight: { alignItems: 'flex-end', gap: 4 },
  hDist: { fontSize: 12, color: COLORS.textMuted, fontWeight: '500' },
  statusPill: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  statusText: { fontSize: 10, fontWeight: '700' },
});

export default LocationPickerScreen;
