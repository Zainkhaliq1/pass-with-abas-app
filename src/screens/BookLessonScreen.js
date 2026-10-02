import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, type } from '../theme/colors';
import { INSTRUCTORS, LESSON_TYPES, CANCELLATION_POLICY } from '../data/mockData';
import { useBookings } from '../context/BookingContext';
import InstructorCard from '../components/InstructorCard';
import PrimaryButton from '../components/PrimaryButton';

const STEPS = ['Instructor', 'Lesson', 'Time', 'Confirm'];

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function BookLessonScreen({ route, navigation }) {
  const presetInstructorId = route.params?.instructorId;
  const { availability, bookSlot } = useBookings();

  const [step, setStep] = useState(presetInstructorId ? 1 : 0);
  const [instructorId, setInstructorId] = useState(presetInstructorId || null);
  const [lessonTypeId, setLessonTypeId] = useState(null);
  const [selectedSlotId, setSelectedSlotId] = useState(null);

  const instructor = INSTRUCTORS.find((i) => i.id === instructorId);
  const lessonType = LESSON_TYPES.find((l) => l.id === lessonTypeId);

  const slotsForInstructor = useMemo(() => {
    if (!instructorId) return [];
    const grouped = {};
    availability
      .filter((s) => s.instructorId === instructorId)
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
      .slice(0, 24)
      .forEach((s) => {
        grouped[s.date] = grouped[s.date] || [];
        grouped[s.date].push(s);
      });
    return grouped;
  }, [availability, instructorId]);

  const canProceed = [
    !!instructorId,
    !!lessonTypeId,
    !!selectedSlotId,
    true,
  ];

  function goNext() {
    if (step < STEPS.length - 1) setStep(step + 1);
  }
  function goBack() {
    if (step === 0) return navigation.goBack();
    setStep(step - 1);
  }

  function confirmBooking() {
    const slot = availability.find((s) => s.id === selectedSlotId);
    if (!slot || !lessonType || !instructor) return;
    bookSlot(slot, lessonType, instructor);
    Alert.alert(
      'Lesson booked!',
      `${lessonType.label} with ${instructor.name} on ${formatDate(slot.date)} at ${slot.time}.`,
      [{ text: 'View my lessons', onPress: () => navigation.navigate('MyLessons') }]
    );
    setStep(0);
    setInstructorId(null);
    setLessonTypeId(null);
    setSelectedSlotId(null);
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={goBack} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </Pressable>
        <Text style={type.h1}>Book a lesson</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.stepper}>
        {STEPS.map((s, i) => (
          <View key={s} style={styles.stepItem}>
            <View style={[styles.stepDot, i <= step && styles.stepDotActive]}>
              <Text style={[styles.stepDotText, i <= step && styles.stepDotTextActive]}>{i + 1}</Text>
            </View>
            <Text style={[styles.stepLabel, i === step && { color: colors.ink, fontWeight: '700' }]}>{s}</Text>
          </View>
        ))}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl }}>
        {step === 0 && (
          <>
            <Text style={type.bodyMuted}>Choose who you'd like to learn with.</Text>
            <View style={{ marginTop: spacing.md }}>
              {INSTRUCTORS.map((i) => (
                <InstructorCard
                  key={i.id}
                  instructor={i}
                  selected={i.id === instructorId}
                  onPress={() => setInstructorId(i.id)}
                />
              ))}
            </View>
          </>
        )}

        {step === 1 && (
          <>
            <Text style={type.bodyMuted}>What kind of lesson do you need?</Text>
            <View style={{ marginTop: spacing.md, gap: spacing.md }}>
              {LESSON_TYPES.map((l) => {
                const selected = l.id === lessonTypeId;
                return (
                  <Pressable
                    key={l.id}
                    onPress={() => setLessonTypeId(l.id)}
                    style={[styles.optionCard, selected && styles.optionCardSelected]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={type.h2}>{l.label}</Text>
                      <Text style={type.bodyMuted}>{l.duration}</Text>
                    </View>
                    <Text style={styles.optionPrice}>£{l.price}</Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        {step === 2 && (
          <>
            <Text style={type.bodyMuted}>
              Available times with {instructor?.name || 'your instructor'}.
            </Text>
            <View style={{ marginTop: spacing.md }}>
              {Object.keys(slotsForInstructor).length === 0 && (
                <Text style={type.body}>No upcoming availability — try another instructor.</Text>
              )}
              {Object.entries(slotsForInstructor).map(([date, slots]) => (
                <View key={date} style={{ marginBottom: spacing.md }}>
                  <Text style={styles.dateHeading}>{formatDate(date)}</Text>
                  <View style={styles.timeRow}>
                    {slots.map((s) => {
                      const selected = s.id === selectedSlotId;
                      return (
                        <Pressable
                          key={s.id}
                          onPress={() => setSelectedSlotId(s.id)}
                          style={[styles.timeChip, selected && styles.timeChipSelected]}
                        >
                          <Text style={[styles.timeChipText, selected && { color: '#fff' }]}>{s.time}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {step === 3 && instructor && lessonType && (
          <>
            <Text style={type.bodyMuted}>Review and confirm your booking.</Text>
            <View style={styles.summaryCard}>
              <SummaryRow label="Instructor" value={instructor.name} />
              <SummaryRow label="Lesson" value={`${lessonType.label} (${lessonType.duration})`} />
              <SummaryRow
                label="Date & time"
                value={
                  selectedSlotId
                    ? `${formatDate(availability.find((s) => s.id === selectedSlotId)?.date)} · ${
                        availability.find((s) => s.id === selectedSlotId)?.time
                      }`
                    : '—'
                }
              />
              <View style={styles.divider} />
              <SummaryRow label="Total" value={`£${lessonType.price}`} bold />
            </View>
            <Text style={styles.policyNote}>{CANCELLATION_POLICY}</Text>
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {step < 3 ? (
          <PrimaryButton label="Continue" onPress={goNext} disabled={!canProceed[step]} />
        ) : (
          <PrimaryButton label="Confirm booking" onPress={confirmBooking} />
        )}
      </View>
    </View>
  );
}

function SummaryRow({ label, value, bold }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={type.bodyMuted}>{label}</Text>
      <Text style={[type.body, bold && { fontWeight: '800', fontSize: 17 }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cloud, paddingTop: 56 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, marginBottom: spacing.md,
  },
  stepper: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  stepItem: { alignItems: 'center', flex: 1 },
  stepDot: {
    width: 26, height: 26, borderRadius: 13, backgroundColor: colors.border,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  stepDotActive: { backgroundColor: colors.go },
  stepDotText: { fontSize: 12, fontWeight: '700', color: colors.inkMuted },
  stepDotTextActive: { color: '#fff' },
  stepLabel: { fontSize: 11, color: colors.inkMuted },
  optionCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card,
    padding: spacing.md, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border,
  },
  optionCardSelected: { borderColor: colors.go, backgroundColor: colors.goLight },
  optionPrice: { fontWeight: '800', fontSize: 17, color: colors.ink },
  dateHeading: { fontWeight: '700', color: colors.ink, marginBottom: spacing.sm },
  timeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeChip: {
    paddingVertical: 10, paddingHorizontal: 14, borderRadius: radius.pill,
    backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border,
  },
  timeChipSelected: { backgroundColor: colors.go, borderColor: colors.go },
  timeChipText: { fontWeight: '700', color: colors.ink },
  summaryCard: {
    marginTop: spacing.md, backgroundColor: colors.card, borderRadius: radius.md,
    padding: spacing.lg, borderWidth: 1, borderColor: colors.border,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  divider: { height: 1, backgroundColor: colors.border, marginBottom: spacing.md },
  footer: { padding: spacing.lg, backgroundColor: colors.cloud },
  policyNote: { marginTop: spacing.md, fontSize: 12, color: colors.inkMuted, lineHeight: 17 },
});
