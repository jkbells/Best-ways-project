/**
 * PatientDetailsScreen
 * Collect patient name, condition, notes, passenger count
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { setFormPatient } from '../store/slices/bookingSlice';
import Button from '../components/common/Button';
import { COLORS, RADIUS } from '../constants';

const CONDITIONS = [
  { key: 'critical', label: 'Critical',  color: COLORS.error,   bg: COLORS.errorBg },
  { key: 'moderate', label: 'Moderate',  color: COLORS.warning, bg: COLORS.warningBg },
  { key: 'stable',   label: 'Stable',    color: COLORS.success, bg: COLORS.successBg },
];

const PatientDetailsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { form } = useSelector(state => state.booking);

  const [name, setName]         = useState(form.patient.name || user?.name || '');
  const [condition, setCondition] = useState(form.patient.condition || 'moderate');
  const [notes, setNotes]       = useState(form.patient.notes || '');
  const [passengers, setPassengers] = useState(form.patient.passengerCount || 1);
  const [forSomeoneElse, setForSomeoneElse] = useState(false);

  const handleContinue = () => {
    dispatch(setFormPatient({ name, condition, notes, passengerCount: passengers }));
    navigation.navigate('ConfirmBookingScreen');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={{ fontSize: 22 }}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Patient Details</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* For someone else toggle */}
          <View style={styles.field}>
            <View style={styles.fieldRow}>
              <View>
                <Text style={styles.fieldLabel}>Book for someone else</Text>
                <Text style={styles.fieldSub}>Enter alternate patient details</Text>
              </View>
              <Switch
                value={forSomeoneElse}
                onValueChange={setForSomeoneElse}
                trackColor={{ true: COLORS.primary }}
                thumbColor="#fff"
              />
            </View>
          </View>

          {/* Patient name */}
          <View style={styles.field}>
            <Text style={styles.label}>PATIENT NAME</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Full name"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          {/* Condition */}
          <View style={styles.field}>
            <Text style={styles.label}>PATIENT CONDITION</Text>
            <View style={styles.conditionRow}>
              {CONDITIONS.map(c => (
                <TouchableOpacity
                  key={c.key}
                  style={[
                    styles.conditionChip,
                    { backgroundColor: c.bg, borderColor: condition === c.key ? c.color : 'transparent' },
                  ]}
                  onPress={() => setCondition(c.key)}
                >
                  <Text style={[styles.conditionText, { color: c.color }]}>{c.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Notes */}
          <View style={styles.field}>
            <Text style={styles.label}>NOTES FOR PARAMEDIC (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g. Chest pain, difficulty breathing, diabetic..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Passengers */}
          <View style={styles.field}>
            <Text style={styles.label}>NUMBER OF PASSENGERS</Text>
            <View style={styles.counterRow}>
              <TouchableOpacity
                style={[styles.counterBtn, passengers <= 1 && styles.counterBtnDisabled]}
                onPress={() => setPassengers(p => Math.max(1, p - 1))}
                disabled={passengers <= 1}
              >
                <Text style={styles.counterBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.counterVal}>{passengers}</Text>
              <TouchableOpacity
                style={[styles.counterBtn, styles.counterBtnActive]}
                onPress={() => setPassengers(p => Math.min(5, p + 1))}
                disabled={passengers >= 5}
              >
                <Text style={[styles.counterBtnText, { color: '#fff' }]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Medical profile hint */}
          {user?.bloodGroup && user.bloodGroup !== 'Unknown' && (
            <View style={styles.medBadge}>
              <Text style={styles.medBadgeText}>
                🩸 Blood Group: {user.bloodGroup}
                {user.allergies?.length ? `  ⚠️ Allergies: ${user.allergies.join(', ')}` : ''}
              </Text>
            </View>
          )}

          <View style={{ height: 20 }} />
          <Button
            title="Continue to Confirm"
            onPress={handleContinue}
            disabled={!name.trim()}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  scroll: { padding: 20, gap: 4 },
  field: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    padding: 16, marginBottom: 12,
  },
  fieldRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  fieldSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  label: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 0.5, marginBottom: 10 },
  input: {
    backgroundColor: COLORS.background, borderRadius: RADIUS.md,
    padding: 12, fontSize: 15, color: COLORS.text,
    borderWidth: 1, borderColor: COLORS.border,
  },
  textArea: { minHeight: 80 },
  conditionRow: { flexDirection: 'row', gap: 10 },
  conditionChip: {
    flex: 1, padding: 12, borderRadius: RADIUS.md,
    alignItems: 'center', borderWidth: 2,
  },
  conditionText: { fontSize: 13, fontWeight: '700' },
  counterRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  counterBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: COLORS.border, alignItems: 'center', justifyContent: 'center',
  },
  counterBtnActive: { backgroundColor: COLORS.primary },
  counterBtnDisabled: { opacity: 0.4 },
  counterBtnText: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  counterVal: { fontSize: 22, fontWeight: '800', color: COLORS.text, minWidth: 32, textAlign: 'center' },
  medBadge: {
    backgroundColor: '#FFF8F8', borderRadius: RADIUS.md,
    padding: 12, borderWidth: 1, borderColor: '#FFE0E0', marginBottom: 12,
  },
  medBadgeText: { fontSize: 13, color: COLORS.primary, fontWeight: '500' },
});

export default PatientDetailsScreen;
