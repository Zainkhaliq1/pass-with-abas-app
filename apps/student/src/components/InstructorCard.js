import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, type } from '../theme/colors';

export default function InstructorCard({ instructor, onPress, selected }) {
  const initials = instructor.name
    .split(' ')
    .map((n) => n[0])
    .join('');

  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, selected && styles.cardSelected]}
    >
      <View style={[styles.avatar, { backgroundColor: instructor.color }]}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={type.h2}>{instructor.name}</Text>
        <Text style={type.bodyMuted}>
          {instructor.title}{instructor.years ? ` · ${instructor.years} ${instructor.years === 1 ? 'yr' : 'yrs'}` : ''}
        </Text>
        {instructor.rating != null && (
          <View style={styles.row}>
            <Ionicons name="star" size={14} color={colors.signal} />
            <Text style={styles.rating}>{instructor.rating}</Text>
            <Text style={type.bodyMuted}>  ({instructor.reviews} reviews)</Text>
          </View>
        )}
        <View style={styles.tagRow}>
          {instructor.transmission.map((t) => (
            <View key={t} style={styles.tag}>
              <Text style={styles.tagText}>{t}</Text>
            </View>
          ))}
          {instructor.car && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{instructor.car}</Text>
            </View>
          )}
        </View>
      </View>
      {selected && (
        <Ionicons name="checkmark-circle" size={24} color={colors.go} style={{ marginLeft: spacing.sm }} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cardSelected: {
    borderColor: colors.go,
    backgroundColor: colors.goLight,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  rating: { fontWeight: '700', color: colors.ink, marginLeft: 4 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.sm, gap: 6 },
  tag: {
    backgroundColor: colors.cloud,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  tagText: { fontSize: 11, fontWeight: '600', color: colors.inkMuted },
});
