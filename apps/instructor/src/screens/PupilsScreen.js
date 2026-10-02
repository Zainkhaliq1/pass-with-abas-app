import React from 'react';
import { View, Text, FlatList, StyleSheet, Linking, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, type } from '../theme/colors';
import { useInstructorData } from '../context/DataContext';

export default function PupilsScreen() {
  const { pupils } = useInstructorData();

  return (
    <View style={styles.screen}>
      <FlatList
        data={pupils}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.lg, paddingTop: 64 }}
        ListHeaderComponent={
          <View style={{ marginBottom: spacing.md }}>
            <Text style={type.display}>Pupils</Text>
            <Text style={type.bodyMuted}>Everyone currently signed up to book lessons.</Text>
          </View>
        }
        ListEmptyComponent={<Text style={type.bodyMuted}>No pupils have signed up yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={type.h2}>{item.name}</Text>
            {!!item.experience && <Text style={styles.tag}>{item.experience}</Text>}
            {!!item.address && <Text style={type.bodyMuted}>{item.address}</Text>}
            {!!item.phone && (
              <Pressable style={styles.callRow} onPress={() => Linking.openURL(`tel:${item.phone}`)}>
                <Ionicons name="call" size={14} color={colors.go} />
                <Text style={styles.callText}>{item.phone}</Text>
              </Pressable>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cloud },
  card: {
    backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  tag: {
    alignSelf: 'flex-start', marginTop: 4, marginBottom: 4, fontSize: 11, fontWeight: '600', color: colors.inkMuted,
    backgroundColor: colors.cloud, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.sm,
  },
  callRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.sm },
  callText: { color: colors.go, fontWeight: '700', fontSize: 13 },
});
