import React from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, type } from '../theme/colors';
import { useBookings } from '../context/BookingContext';
import { CANCELLATION_POLICY } from '../data/mockData';
import LessonCard from '../components/LessonCard';
import PrimaryButton from '../components/PrimaryButton';

export default function MyLessonsScreen({ navigation }) {
  const { bookings, cancelBooking } = useBookings();

  function handleCancel(id) {
    Alert.alert('Cancel lesson?', CANCELLATION_POLICY, [
      { text: 'Keep lesson', style: 'cancel' },
      { text: 'Cancel lesson', style: 'destructive', onPress: () => cancelBooking(id) },
    ]);
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.lg, flexGrow: 1 }}
        ListHeaderComponent={
          <View style={{ marginBottom: spacing.md }}>
            <Text style={type.display}>My Lessons</Text>
            <Text style={type.bodyMuted}>
              {bookings.length} upcoming {bookings.length === 1 ? 'lesson' : 'lessons'}
            </Text>
          </View>
        }
        renderItem={({ item }) => <LessonCard booking={item} onCancel={handleCancel} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={40} color={colors.inkMuted} />
            <Text style={[type.h2, { marginTop: spacing.md }]}>No lessons booked yet</Text>
            <Text style={[type.bodyMuted, { textAlign: 'center', marginTop: 4, marginBottom: spacing.lg }]}>
              Book your first lesson to see it here.
            </Text>
            <PrimaryButton label="Book a lesson" onPress={() => navigation.navigate('Book')} />
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cloud },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, paddingHorizontal: spacing.lg },
});
