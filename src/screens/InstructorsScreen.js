import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { colors, spacing, type } from '../theme/colors';
import { INSTRUCTORS } from '../data/mockData';
import InstructorCard from '../components/InstructorCard';

export default function InstructorsScreen({ navigation }) {
  return (
    <View style={styles.screen}>
      <FlatList
        data={INSTRUCTORS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.lg }}
        ListHeaderComponent={
          <View style={{ marginBottom: spacing.md }}>
            <Text style={type.display}>Instructors</Text>
            <Text style={type.bodyMuted}>Tap an instructor to see their availability.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <InstructorCard
            instructor={item}
            onPress={() => navigation.navigate('Book', { instructorId: item.id })}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cloud },
});
