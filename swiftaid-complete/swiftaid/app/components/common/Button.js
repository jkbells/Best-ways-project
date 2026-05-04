/**
 * Reusable Button Component
 * Supports primary (red), secondary (blue), outline, and ghost variants
 */

import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { COLORS, RADIUS } from '../../constants';

const Button = ({
  title,
  onPress,
  variant = 'primary', // primary | secondary | outline | ghost | danger
  size = 'md',          // sm | md | lg
  loading = false,
  disabled = false,
  icon = null,          // optional left icon component
  style,
  textStyle,
  fullWidth = true,
}) => {
  const styles = getStyles(variant, size, disabled || loading);

  return (
    <TouchableOpacity
      style={[styles.button, fullWidth && { width: '100%' }, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? COLORS.primary : '#fff'} />
      ) : (
        <View style={StyleSheet.flatten([{ flexDirection: 'row', alignItems: 'center', gap: 8 }])}>
          {icon}
          <Text style={[styles.text, textStyle]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const getStyles = (variant, size, disabled) => {
  const sizeMap = {
    sm: { paddingVertical: 10, paddingHorizontal: 20, fontSize: 13 },
    md: { paddingVertical: 15, paddingHorizontal: 24, fontSize: 15 },
    lg: { paddingVertical: 18, paddingHorizontal: 28, fontSize: 17 },
  };
  const s = sizeMap[size];

  const bgMap = {
    primary:   COLORS.primary,
    secondary: COLORS.secondary,
    danger:    COLORS.error,
    outline:   'transparent',
    ghost:     'transparent',
  };

  const textColorMap = {
    primary:   '#fff',
    secondary: '#fff',
    danger:    '#fff',
    outline:   COLORS.primary,
    ghost:     COLORS.textSecondary,
  };

  const borderMap = {
    outline: `1.5px solid ${COLORS.primary}`,
    default: 'none',
  };

  return StyleSheet.create({
    button: {
      backgroundColor: disabled ? '#CCC' : bgMap[variant],
      paddingVertical: s.paddingVertical,
      paddingHorizontal: s.paddingHorizontal,
      borderRadius: RADIUS.lg,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: variant === 'outline' ? 1.5 : 0,
      borderColor: variant === 'outline' ? (disabled ? '#CCC' : COLORS.primary) : 'transparent',
    },
    text: {
      color: disabled ? '#888' : textColorMap[variant],
      fontSize: s.fontSize,
      fontWeight: '600',
    },
  });
};

export default Button;
