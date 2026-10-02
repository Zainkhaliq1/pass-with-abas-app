import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, type } from '../theme/colors';
import { useBookings } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import LessonCard from '../components/LessonCard';

export default function HomeScreen({ navigation }) {
  const { bookings } = useBookings();
  const { profile } = useAuth();
  const nextLesson = bookings[0]
    ? {
        id: bookings[0].id,
        lessonLabel: bookings[0].lesson_types?.label ?? 'Lesson',
        instructorName: bookings[0].instructors?.name ?? 'Instructor',
        date: bookings[0].availability_slots?.date,
        time: bookings[0].availability_slots?.time,
        price: bookings[0].price,
      }
    : null;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: spacing.xl }}>
      <View style={styles.hero}>
        <Text style={styles.wordmark}>
          <Text style={styles.wordmarkWhite}>Pass With </Text>
          <Text style={styles.wordmarkGreen}>Abas</Text>
        </Text>
        <Text style={styles.heroKicker}>Driving School · Wakefield</Text>
        <Text style={styles.heroTitle}>
          {profile?.name ? `Welcome back, ${profile.name.split(' ')[0]}.` : 'Master the road\nwith confidence.'}
        </Text>
        <Text style={styles.heroSub}>
          19 years teaching learners in and around Wakefield. Book a lesson in under a minute.
        </Text>
        <Pressable
          style={styles.cta}
          onPress={() => navigation.navigate('Book')}
        >
          <Text style={styles.ctaText}>Book a lesson</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.asphalt} />
        </Pressable>
      </View>

      <View style={styles.statsRow}>
        <Stat number="19" label="Years in business" />
        <Stat number="2.5k+" label="Test passes" />
        <Stat number="50k+" label="Lessons delivered" />
      </View>

      {nextLesson && (
        <View style={styles.section}>
          <Text style={type.h1}>Your next lesson</Text>
          <View style={{ marginTop: spacing.md }}>
            <LessonCard booking={nextLesson} />
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={type.h1}>Why learners choose us</Text>
        <View style={{ marginTop: spacing.md, gap: spacing.md }}>
          <Feature icon="shield-checkmark" title="DVSA-approved instructors" desc="Every instructor is fully qualified and background-checked." />
          <Feature icon="calendar" title="Flexible booking" desc="Pick the day, time and instructor that suits you — cancel anytime." />
          <Feature icon="trending-up" title="Track your progress" desc="See every lesson you've booked and completed in one place." />
        </View>
      </View>

      <View style={styles.section}>
        <Pressable style={styles.secondaryCta} onPress={() => navigation.navigate('Instructors')}>
          <Text style={styles.secondaryCtaText}>Meet the instructors</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.ink} />
        </Pressable>
      </View>
    </ScrollView>
  );
}

function Stat({ number, label }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statNumber}>{number}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Feature({ icon, title, desc }) {
  return (
    <View style={styles.feature}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={20} color="#fff" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={type.h2}>{title}</Text>
        <Text style={type.bodyMuted}>{desc}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cloud },
  hero: {
    backgroundColor: colors.asphalt,
    paddingTop: 72,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  heroKicker: { color: '#C7CDD6', fontWeight: '600', fontSize: 13, marginBottom: spacing.md },
  wordmark: { marginBottom: 2 },
  wordmarkWhite: { color: '#fff', fontSize: 34, fontWeight: '900', letterSpacing: -0.5 },
  wordmarkGreen: { color: colors.signal, fontSize: 34, fontWeight: '900', letterSpacing: -0.5 },
  heroTitle: { color: '#fff', fontSize: 26, fontWeight: '800', lineHeight: 32, marginTop: spacing.sm },
  heroSub: { color: '#C7CDD6', fontSize: 15, marginTop: spacing.md, lineHeight: 21 },
  cta: {
    marginTop: spacing.lg,
    backgroundColor: colors.signal,
    borderRadius: radius.pill,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    alignSelf: 'flex-start',
  },
  ctaText: { fontWeight: '700', color: colors.asphalt, fontSize: 15 },
  section: { paddingHorizontal: spacing.lg, marginTop: spacing.xl },
  statsRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, marginTop: -spacing.lg,
  },
  stat: {
    flex: 1, backgroundColor: colors.card, marginHorizontal: 4, borderRadius: radius.md,
    paddingVertical: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border,
  },
  statNumber: { fontSize: 20, fontWeight: '800', color: colors.ink },
  statLabel: { fontSize: 11, color: colors.inkMuted, marginTop: 2, textAlign: 'center' },
  feature: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  featureIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.go, alignItems: 'center', justifyContent: 'center',
  },
  secondaryCta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.card, padding: spacing.md, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
  },
  secondaryCtaText: { fontWeight: '700', color: colors.ink, fontSize: 15 },
});
