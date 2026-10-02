import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { colors, radius, spacing, type } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const { profile, session, signOut } = useAuth();

  function handleSignOut() {
    Alert.alert('Sign out?', 'You can sign back in any time.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: signOut },
    ]);
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: spacing.lg, paddingTop: 64 }}>
      <Text style={styles.wordmark}>
        <Text style={styles.wordmarkDark}>Pass With </Text>
        <Text style={styles.wordmarkGreen}>Abas</Text>
      </Text>
      <Text style={styles.staffLabel}>STAFF ACCOUNT</Text>

      <View style={{ marginTop: spacing.lg }}>
        <InfoRow label="Name" value={profile?.name || '—'} />
        <InfoRow label="Email" value={session?.user?.email || '—'} />
        <InfoRow label="Car" value={profile?.car || '—'} />
        <InfoRow label="Transmission" value={(profile?.transmission || []).join(', ') || '—'} />
        {!!profile?.years_experience && <InfoRow label="Years experience" value={String(profile.years_experience)} />}
      </View>

      <Pressable style={styles.signOut} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
    </ScrollView>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={type.label}>{label}</Text>
      <Text style={type.body}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cloud },
  wordmark: { marginBottom: 2 },
  wordmarkDark: { color: colors.ink, fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  wordmarkGreen: { color: colors.signal, fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  staffLabel: { color: colors.go, fontWeight: '800', fontSize: 12, letterSpacing: 1, marginTop: 4 },
  row: {
    backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  signOut: { marginTop: spacing.xl, alignItems: 'center', paddingVertical: spacing.md },
  signOutText: { color: colors.danger, fontWeight: '700', fontSize: 15 },
});
