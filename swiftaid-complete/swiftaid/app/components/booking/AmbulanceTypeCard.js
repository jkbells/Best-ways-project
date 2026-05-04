/**
 * AmbulanceTypeCard — shown on ambulance selection screen
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AMBULANCE_TYPES, COLORS, RADIUS } from '../../constants';
import { formatCurrency } from '../../utils';

const AmbulanceTypeCard = ({ type, isSelected, onSelect, etaMinutes, distanceKm }) => {
  const config = AMBULANCE_TYPES[type];
  if (!config) return null;

  return (
    <TouchableOpacity
      style={[styles.card, isSelected && { borderColor: COLORS.primary, backgroundColor: '#FFF8F8' }]}
      onPress={() => onSelect(type)}
      activeOpacity={0.8}
    >
      {/* Type icon */}
      <View style={[styles.iconBox, { backgroundColor: config.bgColor }]}>
        <Text style={{ fontSize: 22 }}>🚑</Text>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.label}>{config.label}</Text>
        <Text style={styles.sub}>{config.description}</Text>
        <View style={styles.featuresRow}>
          {config.features.slice(0, 3).map(f => (
            <View key={f} style={[styles.feature, { backgroundColor: config.bgColor }]}>
              <Text style={[styles.featureText, { color: config.color }]}>{f}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Price + ETA */}
      <View style={styles.right}>
        <Text style={styles.price}>{formatCurrency(config.baseFare)}+</Text>
        {etaMinutes != null && (
          <Text style={styles.eta}>{etaMinutes} min</Text>
        )}
        {isSelected && (
          <View style={styles.checkBadge}>
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>✓</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.background,
    borderWidth: 1.5, borderColor: COLORS.border,
    borderRadius: RADIUS.lg, padding: 14,
    marginBottom: 10,
  },
  iconBox: {
    width: 52, height: 52, borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
  },
  info: { flex: 1 },
  label: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  sub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  featuresRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 },
  feature: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  featureText: { fontSize: 10, fontWeight: '600' },
  right: { alignItems: 'flex-end', gap: 4 },
  price: { fontSize: 15, fontWeight: '800', color: COLORS.primary },
  eta: { fontSize: 11, color: COLORS.textSecondary },
  checkBadge: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
  },
});

export default AmbulanceTypeCard;
