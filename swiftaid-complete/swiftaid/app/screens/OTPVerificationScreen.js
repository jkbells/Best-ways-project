/**
 * OTP Verification Screen
 * 6-digit code entry with auto-focus and countdown timer
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { verifyOTP, sendOTP } from '../store/slices/authSlice';
import Button from '../components/common/Button';
import { COLORS, RADIUS } from '../constants';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

const OTPVerificationScreen = ({ route, navigation }) => {
  const { phone } = route.params;
  const dispatch = useDispatch();
  const { loading, error, devOTP } = useSelector(state => state.auth);

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const inputRefs = useRef([]);

  // Show dev OTP helper
  useEffect(() => {
    if (devOTP) {
      Alert.alert('Dev Mode', `OTP: ${devOTP}`, [
        { text: 'Autofill', onPress: () => autofillOTP(devOTP) },
        { text: 'OK' },
      ]);
    }
  }, [devOTP]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const autofillOTP = (code) => {
    const digits = code.split('');
    setOtp(digits);
    inputRefs.current[OTP_LENGTH - 1]?.focus();
  };

  const handleInput = (value, index) => {
    // Only accept single digit
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-advance to next input
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < OTP_LENGTH) {
      Alert.alert('Incomplete', 'Please enter all 6 digits.');
      return;
    }

    const result = await dispatch(verifyOTP({ phone, otp: code }));

    if (verifyOTP.fulfilled.match(result)) {
      if (result.payload.isNewUser) {
        navigation.replace('ProfileSetup');
      } else {
        navigation.replace('MainTabs');
      }
    } else {
      Alert.alert('Verification Failed', result.payload || 'Invalid OTP');
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setOtp(Array(OTP_LENGTH).fill(''));
    setCountdown(RESEND_SECONDS);
    inputRefs.current[0]?.focus();
    await dispatch(sendOTP(phone));
  };

  const filledCount = otp.filter(d => d !== '').length;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.content}>
          {/* Back */}
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={{ fontSize: 22 }}>←</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Verify your number</Text>
          <Text style={styles.subtitle}>
            We sent a 6-digit code to{'\n'}
            <Text style={styles.phone}>{phone}</Text>
          </Text>

          {/* OTP Boxes */}
          <View style={styles.otpRow}>
            {Array(OTP_LENGTH).fill(0).map((_, i) => (
              <TextInput
                key={i}
                ref={ref => inputRefs.current[i] = ref}
                style={[
                  styles.otpBox,
                  otp[i] ? styles.otpBoxFilled : {},
                  i === filledCount ? styles.otpBoxActive : {},
                ]}
                keyboardType="number-pad"
                maxLength={1}
                value={otp[i]}
                onChangeText={val => handleInput(val, i)}
                onKeyPress={e => handleKeyPress(e, i)}
                selectTextOnFocus
              />
            ))}
          </View>

          {error && <Text style={styles.error}>{error}</Text>}

          {/* Resend */}
          <View style={styles.resendRow}>
            <Text style={styles.resendLabel}>Didn't receive it? </Text>
            <TouchableOpacity onPress={handleResend} disabled={countdown > 0}>
              <Text style={[styles.resendBtn, countdown > 0 && { color: COLORS.textMuted }]}>
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
              </Text>
            </TouchableOpacity>
          </View>

          <Button
            title="Verify & Continue"
            onPress={handleVerify}
            loading={loading}
            disabled={filledCount < OTP_LENGTH}
            style={{ marginTop: 24 }}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, padding: 28, paddingTop: 20 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.text },
  subtitle: { fontSize: 15, color: COLORS.textSecondary, marginTop: 10, lineHeight: 22 },
  phone: { color: COLORS.text, fontWeight: '700' },
  otpRow: { flexDirection: 'row', gap: 10, marginTop: 36, justifyContent: 'center' },
  otpBox: {
    width: 48, height: 56, borderRadius: RADIUS.md,
    borderWidth: 1.5, borderColor: COLORS.border,
    textAlign: 'center', fontSize: 22, fontWeight: '700', color: COLORS.text,
    backgroundColor: COLORS.surface,
  },
  otpBoxFilled: { borderColor: COLORS.primary, backgroundColor: '#FFF8F8' },
  otpBoxActive: { borderColor: COLORS.secondary },
  error: { color: COLORS.error, fontSize: 13, textAlign: 'center', marginTop: 12 },
  resendRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  resendLabel: { fontSize: 14, color: COLORS.textSecondary },
  resendBtn: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
});

export default OTPVerificationScreen;
