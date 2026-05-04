/**
 * Full-screen loading overlay with animated pulse
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Modal } from 'react-native';
import { COLORS } from '../../constants';

const LoadingOverlay = ({ visible, message = 'Please wait...' }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!visible) return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scaleAnim, { toValue: 1.4, duration: 800, useNativeDriver: true }),
          Animated.timing(opacityAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scaleAnim, { toValue: 1, duration: 0, useNativeDriver: true }),
          Animated.timing(opacityAnim, { toValue: 1, duration: 0, useNativeDriver: true }),
        ]),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [visible]);

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.pulseWrapper}>
            <Animated.View style={[styles.pulseRing, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]} />
            <View style={styles.innerCircle}>
              <Text style={styles.cross}>+</Text>
            </View>
          </View>
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  container: { alignItems: 'center', gap: 20 },
  pulseWrapper: { width: 100, height: 100, alignItems: 'center', justifyContent: 'center' },
  pulseRing: {
    position: 'absolute', width: 100, height: 100, borderRadius: 50,
    backgroundColor: `${COLORS.primary}40`,
  },
  innerCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  cross: { color: '#fff', fontSize: 28, fontWeight: '700' },
  message: { color: '#fff', fontSize: 16, fontWeight: '500', textAlign: 'center' },
});

export default LoadingOverlay;
