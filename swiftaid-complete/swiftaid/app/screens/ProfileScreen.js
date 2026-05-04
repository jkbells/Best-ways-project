/**
 * ProfileScreen — user profile, medical info, settings, logout
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { userAPI } from '../services/api';
import Button from '../components/common/Button';
import { COLORS, RADIUS } from '../constants';
import { disconnectSocket } from '../services/socketService';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];

const SettingItem = ({ icon, label, sub, onPress, right }) => (
  <TouchableOpacity style={styles.settingItem} onPress={onPress} activeOpacity={0.6}>
    <View style={styles.settingIcon}><Text style={{ fontSize: 18 }}>{icon}</Text></View>
    <View style={styles.settingInfo}>
      <Text style={styles.settingLabel}>{label}</Text>
      {sub && <Text style={styles.settingSub}>{sub}</Text>}
    </View>
    {right || <Text style={styles.chevron}>›</Text>}
  </TouchableOpacity>
);

const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [bloodGroup, setBloodGroup] = useState(user?.bloodGroup || 'Unknown');
  const [notifications, setNotifications] = useState(true);

  const handleSave = async () => {
    try {
      await userAPI.updateProfile({ name, bloodGroup });
      setEditing(false);
      Alert.alert('Saved', 'Profile updated successfully!');
    } catch (err) {
      Alert.alert('Error', 'Failed to update profile.');
    }
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => {
          disconnectSocket();
          dispatch(logout());
          navigation.reset({ index: 0, routes: [{ name: 'Splash' }] });
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            {editing ? (
              <TextInput
                style={styles.nameInput}
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor="rgba(255,255,255,0.5)"
              />
            ) : (
              <Text style={styles.profileName}>{user?.name || 'Set your name'}</Text>
            )}
            <Text style={styles.profilePhone}>{user?.phone}</Text>
            {user?.bloodGroup && user.bloodGroup !== 'Unknown' && (
              <View style={styles.bloodBadge}>
                <Text style={styles.bloodText}>🩸 {user.bloodGroup}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => editing ? handleSave() : setEditing(true)}
          >
            <Text style={styles.editBtnText}>{editing ? 'Save' : '✏️'}</Text>
          </TouchableOpacity>
        </View>

        {/* Account section */}
        <Text style={styles.sectionTitle}>ACCOUNT</Text>
        <View style={styles.section}>
          <SettingItem icon="👤" label="Personal Information" sub="Name, phone, email" onPress={() => setEditing(true)} />
          <View style={styles.divider} />
          <SettingItem icon="🩸" label="Medical Profile"
            sub={`Blood: ${user?.bloodGroup || 'Not set'}${user?.allergies?.length ? ` · Allergies: ${user.allergies.join(', ')}` : ''}`}
            onPress={() => {}} />
          <View style={styles.divider} />
          <SettingItem icon="📞" label="Emergency Contacts"
            sub={user?.emergencyContacts?.[0] ? `${user.emergencyContacts[0].name} · ${user.emergencyContacts[0].phone}` : 'Not set'}
            onPress={() => {}} />
        </View>

        {/* Preferences */}
        <Text style={styles.sectionTitle}>PREFERENCES</Text>
        <View style={styles.section}>
          <SettingItem
            icon="🔔" label="Notifications" sub="Booking updates, arrivals"
            right={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ true: COLORS.primary }}
                thumbColor="#fff"
              />
            }
          />
          <View style={styles.divider} />
          <SettingItem icon="🌐" label="Language" sub="English" onPress={() => {}} />
          <View style={styles.divider} />
          <SettingItem icon="💳" label="Payment Methods" sub="Cash, Card, Easypaisa" onPress={() => {}} />
        </View>

        {/* Support */}
        <Text style={styles.sectionTitle}>SUPPORT</Text>
        <View style={styles.section}>
          <SettingItem icon="❓" label="Help & FAQ" onPress={() => {}} />
          <View style={styles.divider} />
          <SettingItem icon="📋" label="Terms of Service" onPress={() => {}} />
          <View style={styles.divider} />
          <SettingItem icon="🔒" label="Privacy Policy" onPress={() => {}} />
        </View>

        {/* Logout */}
        <View style={{ padding: 20 }}>
          <Button title="Log Out" variant="outline" onPress={handleLogout} />
        </View>

        <Text style={styles.version}>SwiftAid v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  profileHeader: {
    backgroundColor: '#0D47A1', flexDirection: 'row', alignItems: 'center',
    padding: 20, paddingTop: 24, gap: 16,
  },
  avatar: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 22, fontWeight: '700' },
  profileInfo: { flex: 1 },
  profileName: { color: '#fff', fontSize: 20, fontWeight: '700' },
  nameInput: { color: '#fff', fontSize: 20, fontWeight: '700', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.5)', paddingBottom: 2 },
  profilePhone: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 },
  bloodBadge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginTop: 6 },
  bloodText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  editBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  editBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  sectionTitle: {
    fontSize: 11, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 0.8,
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8,
  },
  section: { backgroundColor: COLORS.background, marginHorizontal: 0 },
  settingItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingVertical: 14 },
  settingIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' },
  settingInfo: { flex: 1 },
  settingLabel: { fontSize: 14, fontWeight: '500', color: COLORS.text },
  settingSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  chevron: { fontSize: 20, color: COLORS.textMuted },
  divider: { height: 1, backgroundColor: COLORS.border, marginLeft: 70 },
  version: { textAlign: 'center', fontSize: 12, color: COLORS.textMuted, paddingBottom: 24 },
});

export default ProfileScreen;
