import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, type } from '../theme/colors';

export default function ProfileScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: spacing.lg, paddingTop: 64 }}>
      <Text style={styles.wordmark}>
        <Text style={styles.wordmarkDark}>Pass With </Text>
        <Text style={styles.wordmarkGreen}>Abas</Text>
      </Text>
      <Text style={[type.bodyMuted, { marginTop: 4, marginBottom: spacing.lg }]}>
        Driving lessons that build real confidence.
      </Text>

      <InfoRow icon="call" label="Phone" value="07792 390777" onPress={() => Linking.openURL('tel:07792390777')} />
      <InfoRow icon="mail" label="Email" value="passwithabas@live.co.uk" onPress={() => Linking.openURL('mailto:passwithabas@live.co.uk')} />
      <InfoRow icon="location" label="Address" value="76 Northgate, Wakefield" />

      <View style={styles.section}>
        <Text style={type.h1}>Settings</Text>
        <View style={{ marginTop: spacing.md }}>
          <SettingsRow label="Notifications" />
          <SettingsRow label="Payment methods" />
          <SettingsRow label="Help & support" />
          <SettingsRow label="Terms & privacy" />
        </View>
      </View>
    </ScrollView>
  );
}

function InfoRow({ icon, label, value, onPress }) {
  const Wrapper = onPress ? Pressable : View;
  return (
    <Wrapper onPress={onPress} style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={18} color={colors.asphalt} />
      </View>
      <View>
        <Text style={type.label}>{label}</Text>
        <Text style={type.body}>{value}</Text>
      </View>
    </Wrapper>
  );
}

function SettingsRow({ label }) {
  return (
    <Pressable style={styles.settingsRow}>
      <Text style={type.body}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.inkMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cloud },
  wordmark: { marginBottom: 2 },
  wordmarkDark: { color: colors.ink, fontSize: 30, fontWeight: '900', letterSpacing: -0.5 },
  wordmarkGreen: { color: colors.signal, fontSize: 30, fontWeight: '900', letterSpacing: -0.5 },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card,
    padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  infoIcon: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: colors.cloud,
    alignItems: 'center', justifyContent: 'center', marginRight: spacing.md,
  },
  section: { marginTop: spacing.xl },
  settingsRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
});
