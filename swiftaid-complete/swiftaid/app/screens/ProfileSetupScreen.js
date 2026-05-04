/**
 * ProfileSetupScreen — shown to new users after OTP verification
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { setupProfile } from '../store/slices/authSlice';
import Button from '../components/common/Button';
import { COLORS, RADIUS } from '../constants';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const ProfileSetupScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [ecName, setEcName] = useState('');
  const [ecPhone, setEcPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSetup = async () => {
    setLoading(true);
    const profileData = {
      name,
      bloodGroup: bloodGroup || 'Unknown',
      emergencyContacts: ecName && ecPhone ? [{ name: ecName, phone: ecPhone, relationship: 'Emergency Contact' }] : [],
    };
    await dispatch(setupProfile(profileData));
    navigation.replace('MainTabs');
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.emoji}>👋</Text>
            <Text style={styles.title}>Set up your profile</Text>
            <Text style={styles.sub}>This helps paramedics assist you better in emergencies</Text>
          </View>

          <Text style={styles.fieldLabel}>YOUR NAME *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Full name"
            placeholderTextColor={COLORS.textMuted}
          />

          <Text style={styles.fieldLabel}>BLOOD GROUP (Optional)</Text>
          <View style={styles.bloodGrid}>
            {BLOOD_GROUPS.map(bg => (
              <TouchableOpacity
                key={bg}
                style={[styles.bloodBtn, bloodGroup === bg && styles.bloodBtnActive]}
                onPress={() => setBloodGroup(bg)}
              >
                <Text style={[styles.bloodText, bloodGroup === bg && styles.bloodTextActive]}>{bg}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>EMERGENCY CONTACT (Optional)</Text>
          <TextInput
            style={[styles.input, { marginBottom: 10 }]}
            value={ecName}
            onChangeText={setEcName}
            placeholder="Contact name (e.g. Ayesha)"
            placeholderTextColor={COLORS.textMuted}
          />
          <TextInput
            style={styles.input}
            value={ecPhone}
            onChangeText={setEcPhone}
            placeholder="Phone number"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="phone-pad"
          />

          <View style={{ marginTop: 28 }}>
            <Button title="Complete Setup" onPress={handleSetup} loading={loading} disabled={!name.trim()} />
          </View>
          <TouchableOpacity style={{ padding: 14, alignItems: 'center' }} onPress={() => navigation.replace('MainTabs')}>
            <Text style={{ color: COLORS.textMuted, fontSize: 14 }}>Skip for now</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 24 },
  header: { alignItems: 'center', marginBottom: 28 },
  emoji: { fontSize: 48, marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  sub: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 0.5, marginBottom: 10, marginTop: 20 },
  input: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    padding: 14, fontSize: 15, color: COLORS.text,
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  bloodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  bloodBtn: {
    width: 60, padding: 12, borderRadius: RADIUS.md,
    alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  bloodBtnActive: { borderColor: COLORS.primary, backgroundColor: '#FFF0F0' },
  bloodText: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  bloodTextActive: { color: COLORS.primary },
});

export default ProfileSetupScreen;
