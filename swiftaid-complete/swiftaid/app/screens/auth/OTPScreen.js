/**
 * OTP Verification Screen
 * 4-digit OTP input with auto-focus and resend
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  View, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

import { verifyOTP, sendOTP, clearError } from '../../store/slices/authSlice';
import { AppText, Button } from '../../components/common';
import { COLORS, FONTS, FONT_SIZES, SPACING, RADIUS } from '../../constants';

const OTP_LENGTH = 4;

export default function OTPScreen({ navigation }) {
  const dispatch = useDispatch();
  const { loading, error, phone } = useSelector((s) => s.auth);

  const [otp,       setOtp]       = useState(Array(OTP_LENGTH).fill(''));
  const [timer,     setTimer]     = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputs = useRef([]);

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setTimer((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  const handleChange = (text, index) => {
    dispatch(clearError());
    const newOtp = [...otp];
    newOtp[index] = text.slice(-1); // only last char
    setOtp(newOtp);

    // Auto-advance
    if (text && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }

    // Auto-submit when all filled
    if (newOtp.every((d) => d !== '') && text) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyPress = ({ nativeEvent: { key } }, index) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (code) => {
    const otpCode = code || otp.join('');
    if (otpCode.length < OTP_LENGTH) return;

    const result = await dispatch(verifyOTP({ phone, otp: otpCode }));
    if (verifyOTP.rejected.match(result)) {
      setOtp(Array(OTP_LENGTH).fill(''));
      inputs.current[0]?.focus();
    }
    // On success, navigation is handled by AppNavigator (auth state change)
  };

  const handleResend = async () => {
    setCanResend(false);
    setTimer(60);
    setOtp(Array(OTP_LENGTH).fill(''));
    await dispatch(sendOTP({ phone }));
    inputs.current[0]?.focus();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white}/>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.inner}>
          {/* Back */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <AppText style={{ fontSize: 22 }}>←</AppText>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.iconWrap}>
            <AppText style={{ fontSize: 40 }}>📱</AppText>
          </View>
          <AppText variant="h2" style={{ marginBottom: SPACING.sm }}>Verify Number</AppText>
          <AppText variant="caption" style={styles.sub}>
            We sent a {OTP_LENGTH}-digit code to{'\n'}
            <AppText style={{ fontFamily: FONTS.semiBold, color: COLORS.textPrimary }}>{phone}</AppText>
          </AppText>

          {/* OTP boxes */}
          <View style={styles.otpRow}>
            {otp.map((digit, i) => (
              <TextInput
                key={i}
                ref={(ref) => (inputs.current[i] = ref)}
                value={digit}
                onChangeText={(t) => handleChange(t, i)}
                onKeyPress={(e) => handleKeyPress(e, i)}
                keyboardType="number-pad"
                maxLength={1}
                style={[
                  styles.otpBox,
                  digit && styles.otpBoxFilled,
                  error && styles.otpBoxError,
                ]}
                autoFocus={i === 0}
              />
            ))}
          </View>

          {/* Error */}
          {error && (
            <AppText variant="caption" style={styles.error}>{error}</AppText>
          )}

          {/* Resend */}
          <View style={styles.resendRow}>
            {canResend ? (
              <TouchableOpacity onPress={handleResend}>
                <AppText style={{ color: COLORS.primary, fontFamily: FONTS.semiBold }}>
                  Resend OTP
                </AppText>
              </TouchableOpacity>
            ) : (
              <AppText variant="caption" style={{ color: COLORS.textMuted }}>
                Resend in <AppText style={{ color: COLORS.primary, fontFamily: FONTS.semiBold }}>
                  {String(Math.floor(timer / 60)).padStart(2,'0')}:{String(timer % 60).padStart(2,'0')}
                </AppText>
              </AppText>
            )}
          </View>

          {/* Optional medical info prompt */}
          <View style={styles.medCard}>
            <AppText variant="label" style={{ color: COLORS.textMuted, marginBottom: SPACING.sm }}>
              OPTIONAL: SPEED UP EMERGENCY RESPONSE
            </AppText>
            <AppText variant="caption" style={{ color: COLORS.textSecondary }}>
              Add your blood group and allergies in Profile after login — helps paramedics respond faster.
            </AppText>
          </View>

          <Button
            title="Verify & Continue"
            onPress={() => handleVerify()}
            loading={loading}
            disabled={otp.filter(Boolean).length < OTP_LENGTH}
            style={{ marginTop: 'auto' }}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  inner:     { flex: 1, paddingHorizontal: SPACING.xl, paddingTop: SPACING.lg, paddingBottom: SPACING.xxl },
  back:      { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xl },
  iconWrap:  {
    width: 72, height: 72, borderRadius: RADIUS.xl,
    backgroundColor: COLORS.secondaryLight,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  sub: {
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.xxl,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent:'center',
    gap:            SPACING.md,
    marginBottom:   SPACING.lg,
  },
  otpBox: {
    width:          60,
    height:         64,
    borderRadius:   RADIUS.md,
    borderWidth:    2,
    borderColor:    COLORS.border,
    backgroundColor:COLORS.background,
    textAlign:      'center',
    fontSize:       FONT_SIZES.xxl,
    fontFamily:     FONTS.bold,
    color:          COLORS.textPrimary,
  },
  otpBoxFilled: {
    borderColor:     COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  otpBoxError: {
    borderColor: COLORS.error,
  },
  error:    { color: COLORS.error, textAlign: 'center', marginBottom: SPACING.md },
  resendRow:{ alignItems: 'center', marginVertical: SPACING.lg },
  medCard:  {
    backgroundColor: COLORS.background,
    borderRadius:    RADIUS.md,
    padding:         SPACING.lg,
    marginVertical:  SPACING.xl,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
});
