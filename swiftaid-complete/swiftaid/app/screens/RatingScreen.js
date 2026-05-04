/**
 * RatingScreen — Rate driver, add tags & comment
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { submitRating } from '../store/slices/bookingSlice';
import Button from '../components/common/Button';
import { COLORS, RADIUS } from '../constants';

const TAGS = [
  'Professionalism', 'Quick Response', 'Careful Driving',
  'Equipment Ready', 'Calm & Reassuring', 'Clean Ambulance',
  'Skilled Paramedic', 'Excellent Care',
];

const RatingScreen = ({ route, navigation }) => {
  const { bookingId } = route.params;
  const dispatch = useDispatch();
  const { current: booking, loading } = useSelector(state => state.booking);

  const [score, setScore] = useState(0);
  const [hoveredScore, setHoveredScore] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [comment, setComment] = useState('');

  const driver = booking?.ambulance?.driver;

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (score === 0) { Alert.alert('Please select a rating'); return; }
    const result = await dispatch(submitRating({ bookingId, score, tags: selectedTags, comment }));
    if (submitRating.fulfilled.match(result)) {
      navigation.replace('MainTabs');
    } else {
      Alert.alert('Error', 'Could not submit rating. Please try again.');
    }
  };

  const displayScore = hoveredScore || score;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Driver avatar */}
        <View style={styles.driverSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {driver?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'DR'}
            </Text>
          </View>
          <Text style={styles.driverName}>{driver?.name || 'Your Paramedic'}</Text>
          <Text style={styles.driverSub}>How was your experience?</Text>
        </View>

        {/* Star rating */}
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map(n => (
            <TouchableOpacity
              key={n}
              onPress={() => setScore(n)}
              activeOpacity={0.7}
            >
              <Text style={[styles.star, n <= displayScore && styles.starActive]}>★</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.scoreLabel}>
          {score === 0 ? 'Tap to rate' : ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][score]}
        </Text>

        {/* Tags */}
        <Text style={styles.sectionLabel}>What stood out?</Text>
        <View style={styles.tagsGrid}>
          {TAGS.map(tag => (
            <TouchableOpacity
              key={tag}
              style={[styles.tag, selectedTags.includes(tag) && styles.tagSelected]}
              onPress={() => toggleTag(tag)}
            >
              <Text style={[styles.tagText, selectedTags.includes(tag) && styles.tagTextSelected]}>
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Comment */}
        <Text style={styles.sectionLabel}>Additional feedback (optional)</Text>
        <TextInput
          style={styles.commentInput}
          value={comment}
          onChangeText={setComment}
          placeholder="Share your experience..."
          placeholderTextColor={COLORS.textMuted}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <Button
          title="Submit Rating"
          onPress={handleSubmit}
          loading={loading}
          disabled={score === 0}
          style={{ marginTop: 8 }}
        />
        <TouchableOpacity style={styles.skipBtn} onPress={() => navigation.replace('MainTabs')}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.reportBtn}>
          <Text style={styles.reportText}>⚠️ Report an issue</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 24, alignItems: 'center' },
  driverSection: { alignItems: 'center', marginBottom: 24 },
  avatar: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: '700' },
  driverName: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  driverSub: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  starsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  star: { fontSize: 44, color: '#DDD' },
  starActive: { color: '#F4C430' },
  scoreLabel: { fontSize: 16, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 24 },
  sectionLabel: {
    fontSize: 12, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 0.5,
    alignSelf: 'flex-start', marginBottom: 12,
  },
  tagsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-start', width: '100%', marginBottom: 20 },
  tag: {
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: RADIUS.full, borderWidth: 1.5, borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  tagSelected: { borderColor: COLORS.primary, backgroundColor: '#FFF0F0' },
  tagText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  tagTextSelected: { color: COLORS.primary, fontWeight: '700' },
  commentInput: {
    width: '100%', backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg, padding: 14, fontSize: 14, color: COLORS.text,
    borderWidth: 1.5, borderColor: COLORS.border, minHeight: 100, marginBottom: 20,
  },
  skipBtn: { paddingVertical: 14 },
  skipText: { fontSize: 14, color: COLORS.textMuted },
  reportBtn: { paddingVertical: 10 },
  reportText: { fontSize: 14, color: COLORS.primary, fontWeight: '500' },
});

export default RatingScreen;
