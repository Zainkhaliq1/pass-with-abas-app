import React from 'react';
import { View, Text, StyleSheet, SectionList, Pressable, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, type } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useInstructorData } from '../context/DataContext';

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}

export default function DashboardScreen() {
  const { profile } = useAuth();
  const { bookings, cancelBooking, markCompleted } = useInstructorData();

  const sections = React.useMemo(() => {
    const byDate = {};
    bookings
      .filter((b) => b.status === 'confirmed')
      .forEach((b) => {
        const date = b.availability_slots?.date || 'Unknown date';
        byDate[date] = byDate[date] || [];
        byDate[date].push(b);
      });
    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({ title: formatDate(date), data: data.sort((a, b) => (a.availability_slots?.time || '').localeCompare(b.availability_slots?.time || '')) }));
  }, [bookings]);

  function handleCancel(booking) {
    Alert.alert('Cancel this lesson?', 'This will notify the pupil and re-open the slot.', [
      { text: 'Keep it', style: 'cancel' },
      { text: 'Cancel lesson', style: 'destructive', onPress: () => cancelBooking(booking.id).catch((e) => Alert.alert('Could not cancel', e.message)) },
    ]);
  }

  return (
    <SectionList
      style={styles.screen}
      contentContainerStyle={{ padding: spacing.lg, paddingTop: 64, flexGrow: 1 }}
      sections={sections}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View style={{ marginBottom: spacing.md }}>
          <Text style={type.display}>{profile?.name ? `Hi, ${profile.name.split(' ')[0]}` : 'Dashboard'}</Text>
          <Text style={type.bodyMuted}>{bookings.filter((b) => b.status === 'confirmed').length} upcoming lessons</Text>
        </View>
      }
      renderSectionHeader={({ section }) => <Text style={styles.sectionHeader}>{section.title}</Text>}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.cardTop}>
            <Text style={type.h2}>{item.availability_slots?.time}</Text>
            <Text style={styles.price}>£{item.price}</Text>
          </View>
          <Text style={type.body}>{item.pupils?.name}</Text>
          <Text style={type.bodyMuted}>{item.lesson_types?.label}</Text>
          {!!item.pupils?.experience && <Text style={styles.tag}>{item.pupils.experience}</Text>}
          <View style={styles.actionsRow}>
            {!!item.pupils?.phone && (
              <Pressable style={styles.actionBtn} onPress={() => Linking.openURL(`tel:${item.pupils.phone}`)}>
                <Ionicons name="call" size={14} color={colors.go} />
                <Text style={styles.actionText}>Call pupil</Text>
              </Pressable>
            )}
            <Pressable style={styles.actionBtn} onPress={() => markCompleted(item.id).catch((e) => Alert.alert('Error', e.message))}>
              <Ionicons name="checkmark-circle" size={14} color={colors.go} />
              <Text style={styles.actionText}>Mark complete</Text>
            </Pressable>
            <Pressable style={styles.actionBtn} onPress={() => handleCancel(item)}>
              <Ionicons name="close-circle" size={14} color={colors.danger} />
              <Text style={[styles.actionText, { color: colors.danger }]}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      )}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Ionicons name="calendar-outline" size={40} color={colors.inkMuted} />
          <Text style={[type.h2, { marginTop: spacing.md }]}>No bookings yet</Text>
          <Text style={[type.bodyMuted, { textAlign: 'center', marginTop: 4 }]}>
            Open some availability and pupils will be able to book you.
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cloud },
  sectionHeader: { ...type.label, backgroundColor: colors.cloud, paddingVertical: spacing.sm, textTransform: 'none' },
  card: {
    backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  price: { fontWeight: '800', fontSize: 16, color: colors.ink },
  tag: {
    alignSelf: 'flex-start', marginTop: spacing.sm, fontSize: 11, fontWeight: '600', color: colors.inkMuted,
    backgroundColor: colors.cloud, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.sm,
  },
  actionsRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { fontSize: 12, fontWeight: '700', color: colors.go },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
});
