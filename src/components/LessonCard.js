import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, type } from '../theme/colors';

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function LessonCard({ booking, onCancel }) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Ionicons name="car-sport" size={20} color={colors.asphalt} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={type.h2}>{booking.lessonLabel}</Text>
        <Text style={type.bodyMuted}>with {booking.instructorName}</Text>
        <Text style={styles.dateText}>{formatDate(booking.date)} · {booking.time}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.price}>£{booking.price}</Text>
        {onCancel && (
          <Pressable onPress={() => onCancel(booking.id)} hitSlop={8}>
            <Text style={styles.cancel}>Cancel</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cloud,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  dateText: { marginTop: 4, fontWeight: '600', color: colors.go, fontSize: 13 },
  price: { fontWeight: '800', color: colors.ink, fontSize: 16 },
  cancel: { color: colors.danger, fontWeight: '700', fontSize: 12, marginTop: 6 },
});
