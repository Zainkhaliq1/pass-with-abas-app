import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { colors, spacing, type } from '../theme/colors';
import { useBookings } from '../context/BookingContext';
import { colorForInstructor } from '../data/constants';
import InstructorCard from '../components/InstructorCard';

export default function InstructorsScreen({ navigation }) {
  const { instructors } = useBookings();
  return (
    <View style={styles.screen}>
      <FlatList
        data={instructors}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.lg }}
        ListHeaderComponent={
          <View style={{ marginBottom: spacing.md }}>
            <Text style={type.display}>Instructors</Text>
            <Text style={type.bodyMuted}>Tap an instructor to see their availability.</Text>
          </View>
        }
        ListEmptyComponent={<Text style={type.bodyMuted}>No instructors yet — check back soon.</Text>}
        renderItem={({ item }) => (
          <InstructorCard
            instructor={{
              ...item,
              title: item.name === 'Abas' ? 'Founder & Lead Instructor' : 'Instructor',
              years: item.years_experience,
              color: colorForInstructor(item.id),
            }}
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
