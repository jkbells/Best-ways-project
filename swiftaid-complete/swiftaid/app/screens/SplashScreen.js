/**
 * Splash Screen — shown on first launch with onboarding slides
 */

import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, Dimensions,
  TouchableOpacity, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS } from '../constants';

const { width } = Dimensions.get('window');

const SLIDES = [
  { id: '1', emoji: '🚑', title: 'Book in Seconds', body: 'Request an ambulance instantly with just a few taps — no waiting, no complications.' },
  { id: '2', emoji: '📍', title: 'Track in Real-Time', body: 'Watch your ambulance move live on the map from dispatch to your doorstep.' },
  { id: '3', emoji: '🆘', title: 'Emergency SOS', body: 'One-tap emergency button dispatches the nearest available ambulance automatically.' },
  { id: '4', emoji: '💊', title: 'Specialized Care', body: 'Choose from Basic, ALS, ICU, or Neonatal ambulances based on your medical need.' },
];

const SplashScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.replace('Login');
    }
  };

  const handleSkip = () => navigation.replace('Login');

  return (
    <SafeAreaView style={styles.container}>
      {/* Logo */}
      <View style={styles.logoRow}>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>+</Text>
        </View>
        <Text style={styles.appName}>SwiftAid</Text>
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={item => item.id}
        horizontal pagingEnabled showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Text style={styles.slideEmoji}>{item.emoji}</Text>
            <Text style={styles.slideTitle}>{item.title}</Text>
            <Text style={styles.slideBody}>{item.body}</Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === currentIndex && styles.dotActive]} />
        ))}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextBtnText}>
            {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
        {currentIndex < SLIDES.length - 1 && (
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.tagline}>Fast. Reliable. Life-Saving.</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D47A1', alignItems: 'center' },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 24, marginBottom: 20 },
  logoBox: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  logoText: { color: '#fff', fontSize: 24, fontWeight: '900' },
  appName: { color: '#fff', fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  slide: {
    width, alignItems: 'center', paddingHorizontal: 36, paddingTop: 40,
  },
  slideEmoji: { fontSize: 72, marginBottom: 28 },
  slideTitle: { color: '#fff', fontSize: 26, fontWeight: '800', textAlign: 'center', marginBottom: 16 },
  slideBody: { color: 'rgba(255,255,255,0.75)', fontSize: 16, textAlign: 'center', lineHeight: 24 },
  dotsRow: { flexDirection: 'row', gap: 8, marginTop: 32 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.35)' },
  dotActive: { backgroundColor: '#fff', width: 24, borderRadius: 4 },
  actions: { width: '100%', paddingHorizontal: 28, marginTop: 32, gap: 12 },
  nextBtn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.lg,
    paddingVertical: 16, alignItems: 'center',
  },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  skipText: { color: 'rgba(255,255,255,0.6)', textAlign: 'center', fontSize: 14, paddingVertical: 8 },
  tagline: { color: 'rgba(255,255,255,0.5)', fontSize: 13, letterSpacing: 1, marginTop: 24 },
});

export default SplashScreen;
