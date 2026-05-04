/**
 * Login Screen — Phone number entry with OTP flow
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { sendOTP, clearError } from '../store/slices/authSlice';
import Button from '../components/common/Button';
import { COLORS, RADIUS } from '../constants';

const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.auth);
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+92');

  const handleSendOTP = async () => {
    const fullPhone = `${countryCode}${phone.replace(/\s|-/g, '')}`;
    if (phone.length < 10) {
      Alert.alert('Invalid Number', 'Please enter a valid phone number.');
      return;
    }

    const result = await dispatch(sendOTP(fullPhone));
    if (sendOTP.fulfilled.match(result)) {
      navigation.navigate('OTPVerification', { phone: fullPhone });
    } else {
      Alert.alert('Error', result.payload || 'Failed to send OTP.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoBox}><Text style={styles.logoPlus}>+</Text></View>
            <Text style={styles.title}>Welcome to SwiftAid</Text>
            <Text style={styles.subtitle}>Enter your phone number to get started</Text>
          </View>

          {/* Phone input */}
          <View style={styles.inputWrapper}>
            <TouchableOpacity style={styles.countryPicker}>
              <Text style={styles.flag}>🇵🇰</Text>
              <Text style={styles.countryCode}>{countryCode}</Text>
              <Text style={styles.chevron}>▾</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TextInput
              style={styles.phoneInput}
              placeholder="3XX-XXXXXXX"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              maxLength={11}
              returnKeyType="done"
              onSubmitEditing={handleSendOTP}
            />
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <Button
            title="Send Verification Code"
            onPress={handleSendOTP}
            loading={loading}
            disabled={phone.length < 10}
            style={{ marginTop: 24 }}
          />

          {/* Divider */}
          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>or continue with</Text>
            <View style={styles.orLine} />
          </View>

          {/* Social buttons (UI only for MVP) */}
          <TouchableOpacity style={styles.socialBtn}>
            <Text style={styles.socialText}>🌐 Continue with Google</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialBtn}>
            <Text style={styles.socialText}>🍎 Continue with Apple</Text>
          </TouchableOpacity>

          <Text style={styles.terms}>
            By continuing, you agree to our{' '}
            <Text style={styles.link}>Terms of Service</Text> and{' '}
            <Text style={styles.link}>Privacy Policy</Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 28, paddingTop: 48 },
  header: { alignItems: 'center', marginBottom: 40 },
  logoBox: {
    width: 56, height: 56, borderRadius: 16, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  logoPlus: { color: '#fff', fontSize: 28, fontWeight: '900' },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.text, textAlign: 'center' },
  subtitle: { fontSize: 15, color: COLORS.textSecondary, marginTop: 8, textAlign: 'center' },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    borderWidth: 1.5, borderColor: COLORS.border, overflow: 'hidden',
  },
  countryPicker: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 14 },
  flag: { fontSize: 22 },
  countryCode: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  chevron: { fontSize: 10, color: COLORS.textMuted },
  divider: { width: 1, height: 24, backgroundColor: COLORS.border },
  phoneInput: { flex: 1, padding: 14, fontSize: 16, color: COLORS.text },
  errorText: { color: COLORS.error, fontSize: 13, marginTop: 8 },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 24 },
  orLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  orText: { fontSize: 13, color: COLORS.textMuted },
  socialBtn: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.lg,
    padding: 14, alignItems: 'center', marginBottom: 10,
  },
  socialText: { fontSize: 15, fontWeight: '500', color: COLORS.text },
  terms: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center', marginTop: 20, lineHeight: 18 },
  link: { color: COLORS.primary, fontWeight: '600' },
});

export default LoginScreen;
