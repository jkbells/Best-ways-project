/**
 * Common UI Components
 * Reusable building blocks for the app
 */
import React, { useRef } from 'react';
import {
  TouchableOpacity, ActivityIndicator, View,
  TextInput, StyleSheet, Animated,
} from 'react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, RADIUS } from '../../constants';

// ─── Text Component ─────────────────────────────────────────────────────────
export const AppText = ({ style, children, variant = 'body', ...props }) => {
  const fontMap = {
    h1:       { fontSize: FONT_SIZES.xxxl, fontFamily: FONTS.extraBold },
    h2:       { fontSize: FONT_SIZES.xxl,  fontFamily: FONTS.bold      },
    h3:       { fontSize: FONT_SIZES.xl,   fontFamily: FONTS.bold      },
    title:    { fontSize: FONT_SIZES.lg,   fontFamily: FONTS.semiBold  },
    body:     { fontSize: FONT_SIZES.base, fontFamily: FONTS.regular   },
    bodyMed:  { fontSize: FONT_SIZES.base, fontFamily: FONTS.medium    },
    caption:  { fontSize: FONT_SIZES.sm,   fontFamily: FONTS.regular   },
    label:    { fontSize: FONT_SIZES.xs,   fontFamily: FONTS.semiBold  },
  };

  return (
    <Animated.Text
      style={[{ color: COLORS.textPrimary }, fontMap[variant], style]}
      {...props}
    >
      {children}
    </Animated.Text>
  );
};

export default AppText;

// ─── Button Component ────────────────────────────────────────────────────────
export const Button = ({
  onPress, title, variant = 'primary', loading = false,
  disabled = false, style, textStyle, icon, fullWidth = true,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn  = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1.0,  useNativeDriver: true }).start();

  const variants = {
    primary: {
      bg:   disabled ? '#E0E0E0' : COLORS.primary,
      text: COLORS.white,
    },
    secondary: {
      bg:   COLORS.secondaryLight,
      text: COLORS.secondary,
    },
    outline: {
      bg:     'transparent',
      text:   COLORS.textPrimary,
      border: COLORS.border,
    },
    danger: {
      bg:   COLORS.errorLight,
      text: COLORS.error,
    },
    ghost: {
      bg:   'transparent',
      text: COLORS.textSecondary,
    },
  };

  const v = variants[variant] || variants.primary;

  return (
    <Animated.View style={{ transform: [{ scale }], width: fullWidth ? '100%' : undefined }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={disabled || loading}
        activeOpacity={0.9}
        style={[
          styles.btn,
          { backgroundColor: v.bg },
          v.border && { borderWidth: 1.5, borderColor: v.border },
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={v.text} size="small"/>
        ) : (
          <View style={styles.btnContent}>
            {icon && <View style={{ marginRight: SPACING.sm }}>{icon}</View>}
            <AppText variant="bodyMed" style={[{ color: v.text, fontSize: FONT_SIZES.md }, textStyle]}>
              {title}
            </AppText>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Input Component ─────────────────────────────────────────────────────────
export const Input = ({
  label, value, onChangeText, placeholder,
  keyboardType, secureTextEntry, leftIcon, rightIcon,
  error, multiline, numberOfLines, editable = true, style,
}) => (
  <View style={{ marginBottom: SPACING.md }}>
    {label && (
      <AppText variant="label" style={[styles.inputLabel, error && { color: COLORS.error }]}>
        {label}
      </AppText>
    )}
    <View style={[
      styles.inputContainer,
      error && { borderColor: COLORS.error },
      !editable && { opacity: 0.6, backgroundColor: COLORS.background },
    ]}>
      {leftIcon && <View style={styles.inputIcon}>{leftIcon}</View>}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textHint}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        numberOfLines={numberOfLines}
        editable={editable}
        style={[
          styles.input,
          leftIcon && { paddingLeft: 0 },
          multiline && { height: numberOfLines * 24, textAlignVertical: 'top' },
          style,
        ]}
      />
      {rightIcon && <View style={styles.inputIconRight}>{rightIcon}</View>}
    </View>
    {error && <AppText variant="caption" style={{ color: COLORS.error, marginTop: 4 }}>{error}</AppText>}
  </View>
);

// ─── Card Component ──────────────────────────────────────────────────────────
export const Card = ({ children, style, onPress, shadow = true }) => {
  const Container = onPress ? TouchableOpacity : View;
  return (
    <Container
      onPress={onPress}
      activeOpacity={0.92}
      style={[styles.card, shadow && styles.cardShadow, style]}
    >
      {children}
    </Container>
  );
};

// ─── Badge / Pill ────────────────────────────────────────────────────────────
export const Badge = ({ label, color = COLORS.success, bg }) => (
  <View style={[styles.badge, { backgroundColor: bg || color + '20' }]}>
    <AppText variant="label" style={{ color, fontSize: 10 }}>{label}</AppText>
  </View>
);

// ─── Loading Overlay ─────────────────────────────────────────────────────────
export const LoadingOverlay = ({ visible, message }) => {
  if (!visible) return null;
  return (
    <View style={styles.overlay}>
      <View style={styles.overlayCard}>
        <ActivityIndicator color={COLORS.primary} size="large"/>
        {message && <AppText style={{ marginTop: SPACING.md, color: COLORS.textSecondary, textAlign: 'center' }}>{message}</AppText>}
      </View>
    </View>
  );
};

// ─── Divider ─────────────────────────────────────────────────────────────────
export const Divider = ({ style }) => (
  <View style={[{ height: 1, backgroundColor: COLORS.borderLight, marginVertical: SPACING.sm }, style]}/>
);

// ─── Screen Header ────────────────────────────────────────────────────────────
export const ScreenHeader = ({ title, onBack, rightComponent }) => (
  <View style={styles.header}>
    {onBack && (
      <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <AppText style={{ fontSize: 20 }}>←</AppText>
      </TouchableOpacity>
    )}
    <AppText variant="title" style={{ flex: 1, textAlign: onBack ? 'center' : 'left' }}>{title}</AppText>
    {rightComponent || <View style={{ width: onBack ? 36 : 0 }}/>}
  </View>
);

// ─── Empty State ─────────────────────────────────────────────────────────────
export const EmptyState = ({ emoji = '📭', title, subtitle }) => (
  <View style={styles.emptyState}>
    <AppText style={{ fontSize: 48, marginBottom: SPACING.md }}>{emoji}</AppText>
    <AppText variant="title" style={{ textAlign: 'center' }}>{title}</AppText>
    {subtitle && <AppText variant="caption" style={{ color: COLORS.textMuted, textAlign: 'center', marginTop: SPACING.sm }}>{subtitle}</AppText>}
  </View>
);

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  btn: {
    borderRadius:    RADIUS.md,
    paddingVertical: 15,
    paddingHorizontal: SPACING.lg,
    alignItems:      'center',
    justifyContent:  'center',
    minHeight:       52,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems:    'center',
  },
  inputLabel: {
    color:        COLORS.textMuted,
    marginBottom: SPACING.xs,
    letterSpacing:0.5,
    textTransform:'uppercase',
  },
  inputContainer: {
    flexDirection:  'row',
    alignItems:     'center',
    borderWidth:    1.5,
    borderColor:    COLORS.border,
    borderRadius:   RADIUS.md,
    backgroundColor:COLORS.background,
    paddingHorizontal: SPACING.md,
    minHeight:      52,
  },
  input: {
    flex:        1,
    fontFamily:  FONTS.regular,
    fontSize:    FONT_SIZES.md,
    color:       COLORS.textPrimary,
    paddingVertical: SPACING.sm,
  },
  inputIcon:      { marginRight: SPACING.sm },
  inputIconRight: { marginLeft:  SPACING.sm },
  card: {
    backgroundColor: COLORS.white,
    borderRadius:    RADIUS.lg,
    padding:         SPACING.lg,
  },
  cardShadow: {
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius:  8,
    elevation:     3,
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical:   SPACING.xs - 1,
    borderRadius:      RADIUS.full,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems:      'center',
    justifyContent:  'center',
    zIndex:          9999,
  },
  overlayCard: {
    backgroundColor: COLORS.white,
    borderRadius:    RADIUS.xl,
    padding:         SPACING.xxl,
    alignItems:      'center',
    minWidth:        160,
  },
  header: {
    flexDirection:   'row',
    alignItems:      'center',
    paddingHorizontal:SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.borderLight,
  },
  backBtn: {
    width:         36,
    height:        36,
    borderRadius:  RADIUS.sm,
    backgroundColor: COLORS.background,
    alignItems:    'center',
    justifyContent:'center',
    marginRight:   SPACING.md,
  },
  emptyState: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    paddingVertical:SPACING.xxxl,
    paddingHorizontal: SPACING.xxl,
  },
});
