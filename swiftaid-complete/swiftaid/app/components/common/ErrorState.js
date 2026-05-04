import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Button from './Button';
import { COLORS } from '../../constants';

const ErrorState = ({ title = 'Something went wrong', message, onRetry }) => (
  <View style={styles.container}>
    <Text style={styles.icon}>⚠️</Text>
    <Text style={styles.title}>{title}</Text>
    {message && <Text style={styles.message}>{message}</Text>}
    {onRetry && (
      <Button title="Try Again" onPress={onRetry} fullWidth={false}
        style={{ marginTop: 16, paddingHorizontal: 32 }} />
    )}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  icon: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  message: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 20 },
});

export default ErrorState;
