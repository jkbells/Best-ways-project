/**
 * HistoryScreen — past bookings with rebook option
 */

import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHistory } from '../store/slices/bookingSlice';
import EmptyState from '../components/common/EmptyState';
import { COLORS, RADIUS, AMBULANCE_TYPES } from '../constants';
import { formatCurrency, formatDate, getStatusColor, getStatusBg } from '../utils';

const HistoryScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { history, loading, pagination } = useSelector(state => state.booking);

  useEffect(() => { dispatch(fetchHistory({ page: 1 })); }, []);

  const renderItem = ({ item }) => {
    const typeConfig = AMBULANCE_TYPES[item.ambulanceType];
    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => {/* could navigate to detail */}}
        activeOpacity={0.7}
      >
        <View style={[styles.itemIcon, { backgroundColor: typeConfig?.bgColor || '#F5F5F5' }]}>
          <Text style={{ fontSize: 22 }}>🚑</Text>
        </View>

        <View style={styles.itemInfo}>
          <Text style={styles.itemRoute} numberOfLines={1}>
            {item.pickup?.address?.split(',')[0]} → {item.destination?.address?.split(',')[0]}
          </Text>
          <Text style={styles.itemMeta}>
            {formatDate(item.createdAt)} · {typeConfig?.label}
          </Text>
          {item.ambulance?.driver?.name && (
            <Text style={styles.itemDriver}>👤 {item.ambulance.driver.name}</Text>
          )}
        </View>

        <View style={styles.itemRight}>
          <Text style={styles.itemFare}>{item.fare?.total ? formatCurrency(item.fare.total) : '—'}</Text>
          <View style={[styles.statusPill, { backgroundColor: getStatusBg(item.status) }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status === 'completed' ? 'Done' : item.status === 'cancelled' ? 'Cancelled' : item.status}
            </Text>
          </View>
          <TouchableOpacity style={styles.rebookBtn}>
            <Text style={styles.rebookText}>Rebook</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Booking History</Text>
      </View>

      {loading && history.length === 0 ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          ListEmptyComponent={
            <EmptyState
              emoji="📋"
              title="No bookings yet"
              message="Your past ambulance bookings will appear here."
            />
          }
          ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: COLORS.border, marginLeft: 76 }} />}
          onEndReached={() => {
            if (pagination.page < pagination.pages) {
              dispatch(fetchHistory({ page: pagination.page + 1 }));
            }
          }}
          onEndReachedThreshold={0.5}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  item: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 20, paddingVertical: 14,
  },
  itemIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  itemInfo: { flex: 1 },
  itemRoute: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  itemMeta: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  itemDriver: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  itemRight: { alignItems: 'flex-end', gap: 4 },
  itemFare: { fontSize: 14, fontWeight: '800', color: COLORS.text },
  statusPill: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 11, fontWeight: '700' },
  rebookBtn: { backgroundColor: '#FFF0F0', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  rebookText: { fontSize: 11, color: COLORS.primary, fontWeight: '700' },
});

export default HistoryScreen;
