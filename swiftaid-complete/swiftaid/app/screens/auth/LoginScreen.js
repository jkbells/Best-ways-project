/**
 * Login Screen
 * Phone number entry for OTP authentication
 */
import React, { useState } from 'react';
import {
  View, StyleSheet, KeyboardAvoidingView, Platform,
  TouchableOpacity, ScrollView, StatusBar, Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';

import { sendOTP, setPhone } from '../../store/slices/authSlice';
import { AppText, Button, Input } from '../../components/common';
import { COLORS, FONTS, FONT_SIZES, SPACING, RADIUS } from '../../constants';

export default function LoginScreen({ navigation }) {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [phone, setPhoneLocal] = useState('');
  const [name, setName]        = useState('');
  const [isNew, setIsNew]      = useState(false);
  const [phoneError, setPhoneError] = useState('');

  const validatePhone = (p) => /^\+?[\d\s\-]{10,15}$/.test(p.trim());

  const handleSendOTP = async () => {
    if (!validatePhone(phone)) {
      setPhoneError('Please enter a valid phone number');
      return;
    }
    setPhoneError('');
    dispatch(setPhone(phone.trim()));

    const result = await dispatch(sendOTP({ phone: phone.trim(), name: name.trim() }));
    if (sendOTP.fulfilled.match(result)) {
      navigation.navigate('OTP');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white}/>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoArea}>
            <View style={styles.logoCircle}>
              <AppText style={{ fontSize: 36 }}>🚑</AppText>
            </View>
            <AppText variant="h2" style={{ marginTop: SPACING.lg }}>SwiftAid</AppText>
            <AppText variant="caption" style={styles.tagline}>
              Fast. Reliable. Life-Saving.
            </AppText>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <AppText variant="h3" style={{ marginBottom: SPACING.xs }}>Welcome</AppText>
            <AppText variant="caption" style={styles.subtitle}>
              Enter your phone number to get started
            </AppText>

            {/* Toggle new / existing */}
            <View style={styles.toggle}>
              <TouchableOpacity
                onPress={() => setIsNew(false)}
                style={[styles.toggleBtn, !isNew && styles.toggleActive]}
              >
                <AppText style={[styles.toggleText, !isNew && styles.toggleActiveText]}>
                  Login
                </AppText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsNew(true)}
                style={[styles.toggleBtn, isNew && styles.toggleActive]}
              >
                <AppText style={[styles.toggleText, isNew && styles.toggleActiveText]}>
                  Sign Up
                </AppText>
              </TouchableOpacity>
            </View>

            {isNew && (
              <Input
                label="Full Name"
                value={name}
                onChangeText={setName}
                placeholder="Muhammad Ali"
                leftIcon={<AppText>👤</AppText>}
              />
            )}

            <Input
              label="Phone Number"
              value={phone}
              onChangeText={(t) => { setPhoneLocal(t); setPhoneError(''); }}
              placeholder="+92 300 1234567"
              keyboardType="phone-pad"
              leftIcon={<AppText style={{ fontSize: 20 }}>🇵🇰</AppText>}
              error={phoneError || error}
            />

            {/* Dev OTP hint */}
            {__DEV__ && (
              <View style={styles.devHint}>
                <AppText variant="caption" style={{ color: COLORS.warning }}>
                  Dev: OTP is always 1234
                </AppText>
              </View>
            )}

            <Button
              title="Send OTP"
              onPress={handleSendOTP}
              loading={loading}
              style={{ marginTop: SPACING.md }}
            />

            {/* Social login divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine}/>
              <AppText variant="caption" style={{ color: COLORS.textMuted, paddingHorizontal: SPACING.md }}>
                or continue with
              </AppText>
              <View style={styles.dividerLine}/>
            </View>

            {/* Google / Apple buttons */}
            <Button
              title="Continue with Google"
              variant="outline"
              onPress={() => {/* Firebase Google login */}}
              style={{ marginBottom: SPACING.sm }}
            />

            {Platform.OS === 'ios' && (
              <Button
                title="Continue with Apple"
                variant="outline"
                onPress={() => {/* Apple Sign In */}}
              />
            )}
          </View>

          <AppText variant="caption" style={styles.terms}>
            By continuing, you agree to our{' '}
            <AppText style={{ color: COLORS.primary }}>Terms</AppText> and{' '}
            <AppText style={{ color: COLORS.primary }}>Privacy Policy</AppText>
          </AppText>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scroll:    { flexGrow: 1, paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xxl },
  logoArea:  { alignItems: 'center', paddingTop: SPACING.xxxl, paddingBottom: SPACING.xl },
  logoCircle:{
    width: 80, height: 80, borderRadius: RADIUS.xl,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  tagline:  { color: COLORS.textMuted, marginTop: SPACING.xs },
  form:     { flex: 1 },
  subtitle: { color: COLORS.textSecondary, marginBottom: SPACING.xl },
  toggle:   {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: 4,
    marginBottom: SPACING.xl,
  },
  toggleBtn:        { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: RADIUS.sm - 2 },
  toggleActive:     { backgroundColor: COLORS.white, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  toggleText:       { fontFamily: FONTS.medium, fontSize: FONT_SIZES.base, color: COLORS.textMuted },
  toggleActiveText: { color: COLORS.textPrimary },
  devHint:    {
    backgroundColor: '#FFF8E1', borderRadius: RADIUS.sm,
    padding: SPACING.sm, marginBottom: SPACING.sm,
  },
  divider:     { flexDirection: 'row', alignItems: 'center', marginVertical: SPACING.xl },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  terms:       { textAlign: 'center', color: COLORS.textMuted, paddingTop: SPACING.lg },
});
