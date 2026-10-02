// Pass With Abas — single-file version for Expo Snack
// (Same app as the multi-file project, merged into one file so it's easy
// to paste into snack.expo.dev from a phone with no computer.)

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, FlatList, Alert, Linking, ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// NOTE: this build has no navigation library dependency (Snack sometimes
// fails to resolve @react-navigation's sub-packages). Screens are switched
// with plain React state instead — same 5 screens, same features.

/* ---------------------------- THEME ---------------------------- */
// Matches the school's real branding: black, white, and a vivid brand green.
const colors = {
  asphalt: '#0E1210', signal: '#7ED321', go: '#2E7D5B', goLight: '#E4F2EC',
  cloud: '#F4F5F7', card: '#FFFFFF', ink: '#181C19', inkMuted: '#6B7280',
  border: '#E4E6EA', danger: '#C0392B',
};
const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
const radius = { sm: 8, md: 14, lg: 20, pill: 999 };
const type = {
  display: { fontSize: 30, fontWeight: '800', color: colors.ink, letterSpacing: -0.5 },
  h1: { fontSize: 22, fontWeight: '700', color: colors.ink },
  h2: { fontSize: 18, fontWeight: '700', color: colors.ink },
  body: { fontSize: 15, fontWeight: '400', color: colors.ink },
  bodyMuted: { fontSize: 14, fontWeight: '400', color: colors.inkMuted },
  label: { fontSize: 13, fontWeight: '600', color: colors.inkMuted },
};

/* -------------------------- MOCK DATA --------------------------- */
// Real team from passwithabas.co.uk/our-team. The site doesn't publish
// per-instructor years of experience (beyond Abas as founder, and Zain
// at 1 year as confirmed), so those are left out rather than invented.
const INSTRUCTORS = [
  { id: 'abas', name: 'Abas', title: 'Founder & Lead Instructor', years: 19,
    transmission: ['Manual'], car: 'Audi A3', color: '#0E1210' },
  { id: 'haleema', name: 'Haleema', title: 'Instructor',
    transmission: ['Automatic'], car: 'Toyota Yaris Hybrid', color: '#2E7D5B' },
  { id: 'imran', name: 'Imran', title: 'Instructor',
    transmission: ['Manual'], car: 'VW Golf', color: '#4B5563' },
  { id: 'ali', name: 'Ali', title: 'Instructor',
    transmission: ['Manual'], car: 'Mercedes-Benz A-Class', color: '#1F2A24' },
  { id: 'khubaiba', name: 'Khubaiba Khan', title: 'Instructor',
    transmission: ['Automatic'], car: 'Toyota Yaris', color: '#6B8E23' },
  { id: 'zain', name: 'Zain', title: 'Instructor', years: 1,
    transmission: ['Automatic'], car: 'Toyota Corolla', color: '#3B7A3B' },
  { id: 'flimon', name: 'Flimon', title: 'Instructor',
    transmission: ['Automatic'], car: 'Toyota Corolla', color: '#5B6B5E' },
];

// Real cancellation policy from Pass With Abas Terms & Conditions.
const CANCELLATION_POLICY =
  "Lessons cancelled or rearranged with less than 48 hours' notice are charged at the full lesson cost. " +
  'For intensive courses or block bookings, at least one week\'s notice is required for cancellations or significant changes. ' +
  'Administrative fees may apply.';

// Real pricing: £40/hour, £380 for a 10-hour block.
const LESSON_TYPES = [
  { id: 'beginner', label: 'Beginner Lesson', duration: '1 hour', price: 40 },
  { id: 'manual', label: 'Manual Driving Lesson', duration: '1 hour', price: 40 },
  { id: 'automatic', label: 'Automatic Driving Lesson', duration: '1 hour', price: 40 },
  { id: 'refresher', label: 'Refresher Lesson', duration: '1 hour', price: 40 },
  { id: 'motorway', label: 'Motorway Driving Course', duration: '2 hours', price: 80 },
  { id: 'advanced', label: 'Advanced Driving Course', duration: '2 hours', price: 80 },
  { id: 'pass-plus', label: 'Pass Plus Course', duration: '2 hours', price: 80 },
  { id: 'block-10', label: '10-Hour Block Booking', duration: '10 hours', price: 380 },
];

function generateAvailability(days = 14) {
  const times = ['08:00', '10:00', '12:30', '15:00', '17:30'];
  const out = [];
  const today = new Date();
  let added = 0, offset = 1;
  while (added < days) {
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    offset += 1;
    if (d.getDay() === 0) continue;
    const dateStr = d.toISOString().slice(0, 10);
    INSTRUCTORS.forEach((instr) => {
      times.forEach((t, i) => {
        const seed = (d.getDate() + instr.id.length + i) % 3;
        if (seed !== 0) out.push({ id: `${instr.id}-${dateStr}-${t}`, instructorId: instr.id, date: dateStr, time: t });
      });
    });
    added += 1;
  }
  return out;
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

/* ------------------------ BOOKING CONTEXT ------------------------ */
const STORAGE_KEY = 'pwa_bookings_v1';
const BookingContext = createContext(null);

function BookingProvider({ children }) {
  const [bookings, setBookings] = useState([]);
  const [availability, setAvailability] = useState([]);

  useEffect(() => {
    setAvailability(generateAvailability(14));
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setBookings(JSON.parse(raw));
      } catch (e) { console.warn('Could not load saved bookings', e); }
    })();
  }, []);

  const persist = useCallback(async (next) => {
    setBookings(next);
    try { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)); }
    catch (e) { console.warn('Could not save bookings', e); }
  }, []);

  const bookSlot = useCallback((slot, lessonType, instructor) => {
    const newBooking = {
      id: `bk-${Date.now()}`, slotId: slot.id, instructorId: instructor.id, instructorName: instructor.name,
      date: slot.date, time: slot.time, lessonTypeId: lessonType.id, lessonLabel: lessonType.label,
      price: lessonType.price, status: 'confirmed', createdAt: new Date().toISOString(),
    };
    persist([newBooking, ...bookings]);
    setAvailability((prev) => prev.filter((s) => s.id !== slot.id));
    return newBooking;
  }, [bookings, persist]);

  const cancelBooking = useCallback((bookingId) => {
    const target = bookings.find((b) => b.id === bookingId);
    persist(bookings.filter((b) => b.id !== bookingId));
    if (target) {
      setAvailability((prev) => [...prev, { id: target.slotId, instructorId: target.instructorId, date: target.date, time: target.time }]);
    }
  }, [bookings, persist]);

  return (
    <BookingContext.Provider value={{ bookings, availability, bookSlot, cancelBooking }}>
      {children}
    </BookingContext.Provider>
  );
}
function useBookings() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBookings must be used inside BookingProvider');
  return ctx;
}

/* --------------------------- COMPONENTS --------------------------- */
function PrimaryButton({ label, onPress, variant = 'primary', disabled, loading }) {
  const isGhost = variant === 'ghost';
  const isDanger = variant === 'danger';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btnBase,
        isGhost && styles.btnGhost,
        isDanger && styles.btnDanger,
        !isGhost && !isDanger && styles.btnPrimary,
        (disabled || loading) && { opacity: 0.5 },
        pressed && !disabled && { transform: [{ scale: 0.98 }] },
      ]}
    >
      {loading ? <ActivityIndicator color={isGhost ? colors.asphalt : '#fff'} /> : (
        <Text style={[styles.btnLabel, { color: isDanger ? '#fff' : colors.asphalt }]}>{label}</Text>
      )}
    </Pressable>
  );
}

function InstructorCard({ instructor, onPress, selected }) {
  const initials = instructor.name.split(' ').map((n) => n[0]).join('');
  return (
    <Pressable onPress={onPress} style={[styles.instructorCard, selected && styles.instructorCardSelected]}>
      <View style={[styles.avatar, { backgroundColor: instructor.color }]}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={type.h2}>{instructor.name}</Text>
        <Text style={type.bodyMuted}>
          {instructor.title}{instructor.years ? ` · ${instructor.years} ${instructor.years === 1 ? 'yr' : 'yrs'}` : ''}
        </Text>
        {instructor.rating != null && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <Ionicons name="star" size={14} color={colors.signal} />
            <Text style={{ fontWeight: '700', color: colors.ink, marginLeft: 4 }}>{instructor.rating}</Text>
            <Text style={type.bodyMuted}>  ({instructor.reviews} reviews)</Text>
          </View>
        )}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.sm, gap: 6 }}>
          {instructor.transmission.map((t) => (
            <View key={t} style={styles.tag}><Text style={styles.tagText}>{t}</Text></View>
          ))}
          {instructor.car && (
            <View style={styles.tag}><Text style={styles.tagText}>{instructor.car}</Text></View>
          )}
        </View>
      </View>
      {selected && <Ionicons name="checkmark-circle" size={24} color={colors.go} style={{ marginLeft: spacing.sm }} />}
    </Pressable>
  );
}

function LessonCard({ booking, onCancel }) {
  return (
    <View style={styles.lessonCard}>
      <View style={styles.lessonIcon}><Ionicons name="car-sport" size={20} color={colors.asphalt} /></View>
      <View style={{ flex: 1 }}>
        <Text style={type.h2}>{booking.lessonLabel}</Text>
        <Text style={type.bodyMuted}>with {booking.instructorName}</Text>
        <Text style={{ marginTop: 4, fontWeight: '600', color: colors.go, fontSize: 13 }}>
          {formatDate(booking.date)} · {booking.time}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ fontWeight: '800', color: colors.ink, fontSize: 16 }}>£{booking.price}</Text>
        {onCancel && (
          <Pressable onPress={() => onCancel(booking.id)} hitSlop={8}>
            <Text style={{ color: colors.danger, fontWeight: '700', fontSize: 12, marginTop: 6 }}>Cancel</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

/* ---------------------------- SCREENS ---------------------------- */
function HomeScreen({ onNavigate }) {
  const { bookings } = useBookings();
  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: spacing.xl }}>
      <View style={styles.hero}>
        <Text style={styles.wordmark}>
          <Text style={styles.wordmarkWhite}>Pass With </Text>
          <Text style={styles.wordmarkGreen}>Abas</Text>
        </Text>
        <Text style={styles.heroKicker}>Driving School · Wakefield</Text>
        <Text style={styles.heroTitle}>Master the road{'\n'}with confidence.</Text>
        <Text style={styles.heroSub}>19 years teaching learners in and around Wakefield. Book a lesson in under a minute.</Text>
        <Pressable style={styles.cta} onPress={() => onNavigate('Book')}>
          <Text style={styles.ctaText}>Book a lesson</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.asphalt} />
        </Pressable>
      </View>

      <View style={styles.statsRow}>
        {[['19', 'Years in business'], ['2.5k+', 'Test passes'], ['50k+', 'Lessons delivered']].map(([n, l]) => (
          <View key={l} style={styles.stat}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: colors.ink }}>{n}</Text>
            <Text style={{ fontSize: 11, color: colors.inkMuted, marginTop: 2, textAlign: 'center' }}>{l}</Text>
          </View>
        ))}
      </View>

      {bookings.length > 0 && (
        <View style={styles.section}>
          <Text style={type.h1}>Your next lesson</Text>
          <View style={{ marginTop: spacing.md }}><LessonCard booking={bookings[0]} /></View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={type.h1}>Why learners choose us</Text>
        <View style={{ marginTop: spacing.md, gap: spacing.md }}>
          {[
            ['shield-checkmark', 'Experienced instructors', '19 years teaching learners in Wakefield.'],
            ['calendar', 'Flexible booking', 'Pick the day, time and instructor that suits you.'],
            ['trending-up', 'High pass rate', 'Over 2,500 test passes and counting.'],
          ].map(([icon, title, desc]) => (
            <View key={title} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md }}>
              <View style={styles.featureIcon}><Ionicons name={icon} size={20} color="#fff" /></View>
              <View style={{ flex: 1 }}>
                <Text style={type.h2}>{title}</Text>
                <Text style={type.bodyMuted}>{desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Pressable style={styles.secondaryCta} onPress={() => onNavigate('Instructors')}>
          <Text style={{ fontWeight: '700', color: colors.ink, fontSize: 15 }}>Meet the instructors</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.ink} />
        </Pressable>
      </View>
    </ScrollView>
  );
}

function InstructorsScreen({ onNavigate }) {
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
          <InstructorCard instructor={item} onPress={() => onNavigate('Book', { instructorId: item.id })} />
        )}
      />
    </View>
  );
}

const STEPS = ['Instructor', 'Lesson', 'Time', 'Confirm'];

function BookLessonScreen({ presetInstructorId, onNavigate }) {
  const { availability, bookSlot } = useBookings();
  const [step, setStep] = useState(presetInstructorId ? 1 : 0);
  const [instructorId, setInstructorId] = useState(presetInstructorId || null);
  const [lessonTypeId, setLessonTypeId] = useState(null);
  const [selectedSlotId, setSelectedSlotId] = useState(null);

  // If the user tapped an instructor card elsewhere, jump straight to step 1.
  useEffect(() => {
    if (presetInstructorId) {
      setInstructorId(presetInstructorId);
      setStep(1);
    }
  }, [presetInstructorId]);

  const instructor = INSTRUCTORS.find((i) => i.id === instructorId);
  const lessonType = LESSON_TYPES.find((l) => l.id === lessonTypeId);

  const slotsForInstructor = useMemo(() => {
    if (!instructorId) return {};
    const grouped = {};
    availability.filter((s) => s.instructorId === instructorId)
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
      .slice(0, 24)
      .forEach((s) => { grouped[s.date] = grouped[s.date] || []; grouped[s.date].push(s); });
    return grouped;
  }, [availability, instructorId]);

  const canProceed = [!!instructorId, !!lessonTypeId, !!selectedSlotId, true];

  function goNext() { if (step < STEPS.length - 1) setStep(step + 1); }
  function goBack() { if (step === 0) return onNavigate('Home'); setStep(step - 1); }

  function confirmBooking() {
    const slot = availability.find((s) => s.id === selectedSlotId);
    if (!slot || !lessonType || !instructor) return;
    bookSlot(slot, lessonType, instructor);
    Alert.alert('Lesson booked!', `${lessonType.label} with ${instructor.name} on ${formatDate(slot.date)} at ${slot.time}.`, [
      { text: 'View my lessons', onPress: () => onNavigate('MyLessons') },
    ]);
    setStep(0); setInstructorId(null); setLessonTypeId(null); setSelectedSlotId(null);
  }

  return (
    <View style={[styles.screen, { paddingTop: 56 }]}>
      <View style={styles.bookHeader}>
        <Pressable onPress={goBack} hitSlop={10}><Ionicons name="arrow-back" size={22} color={colors.ink} /></Pressable>
        <Text style={type.h1}>Book a lesson</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.stepper}>
        {STEPS.map((s, i) => (
          <View key={s} style={{ alignItems: 'center', flex: 1 }}>
            <View style={[styles.stepDot, i <= step && { backgroundColor: colors.go }]}>
              <Text style={[styles.stepDotText, i <= step && { color: '#fff' }]}>{i + 1}</Text>
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
                <InstructorCard key={i.id} instructor={i} selected={i.id === instructorId} onPress={() => setInstructorId(i.id)} />
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
                  <Pressable key={l.id} onPress={() => setLessonTypeId(l.id)} style={[styles.optionCard, selected && styles.optionCardSelected]}>
                    <View style={{ flex: 1 }}>
                      <Text style={type.h2}>{l.label}</Text>
                      <Text style={type.bodyMuted}>{l.duration}</Text>
                    </View>
                    <Text style={{ fontWeight: '800', fontSize: 17, color: colors.ink }}>£{l.price}</Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}
        {step === 2 && (
          <>
            <Text style={type.bodyMuted}>Available times with {instructor?.name || 'your instructor'}.</Text>
            <View style={{ marginTop: spacing.md }}>
              {Object.keys(slotsForInstructor).length === 0 && <Text style={type.body}>No upcoming availability — try another instructor.</Text>}
              {Object.entries(slotsForInstructor).map(([date, slots]) => (
                <View key={date} style={{ marginBottom: spacing.md }}>
                  <Text style={{ fontWeight: '700', color: colors.ink, marginBottom: spacing.sm }}>{formatDate(date)}</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {slots.map((s) => {
                      const selected = s.id === selectedSlotId;
                      return (
                        <Pressable key={s.id} onPress={() => setSelectedSlotId(s.id)} style={[styles.timeChip, selected && { backgroundColor: colors.go, borderColor: colors.go }]}>
                          <Text style={{ fontWeight: '700', color: selected ? '#fff' : colors.ink }}>{s.time}</Text>
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
              <SummaryRow label="Date & time" value={selectedSlotId ? `${formatDate(availability.find((s) => s.id === selectedSlotId)?.date)} · ${availability.find((s) => s.id === selectedSlotId)?.time}` : '—'} />
              <View style={{ height: 1, backgroundColor: colors.border, marginBottom: spacing.md }} />
              <SummaryRow label="Total" value={`£${lessonType.price}`} bold />
            </View>
            <Text style={{ marginTop: spacing.md, fontSize: 12, color: colors.inkMuted, lineHeight: 17 }}>{CANCELLATION_POLICY}</Text>
          </>
        )}
      </ScrollView>

      <View style={{ padding: spacing.lg }}>
        {step < 3
          ? <PrimaryButton label="Continue" onPress={goNext} disabled={!canProceed[step]} />
          : <PrimaryButton label="Confirm booking" onPress={confirmBooking} />}
      </View>
    </View>
  );
}
function SummaryRow({ label, value, bold }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md }}>
      <Text style={type.bodyMuted}>{label}</Text>
      <Text style={[type.body, bold && { fontWeight: '800', fontSize: 17 }]}>{value}</Text>
    </View>
  );
}

function MyLessonsScreen({ onNavigate }) {
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
            <Text style={type.bodyMuted}>{bookings.length} upcoming {bookings.length === 1 ? 'lesson' : 'lessons'}</Text>
          </View>
        }
        renderItem={({ item }) => <LessonCard booking={item} onCancel={handleCancel} />}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 80 }}>
            <Ionicons name="calendar-outline" size={40} color={colors.inkMuted} />
            <Text style={[type.h2, { marginTop: spacing.md }]}>No lessons booked yet</Text>
            <Text style={[type.bodyMuted, { textAlign: 'center', marginTop: 4, marginBottom: spacing.lg }]}>Book your first lesson to see it here.</Text>
            <PrimaryButton label="Book a lesson" onPress={() => onNavigate('Book')} />
          </View>
        }
      />
    </View>
  );
}

function ProfileScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: spacing.lg, paddingTop: 64 }}>
      <Text style={styles.wordmark}>
        <Text style={styles.wordmarkDark}>Pass With </Text>
        <Text style={styles.wordmarkGreen}>Abas</Text>
      </Text>
      <Text style={[type.bodyMuted, { marginTop: 4, marginBottom: spacing.lg }]}>Driving lessons that build real confidence.</Text>
      <InfoRow icon="call" label="Phone" value="07792 390777" onPress={() => Linking.openURL('tel:07792390777')} />
      <InfoRow icon="mail" label="Email" value="passwithabas@live.co.uk" onPress={() => Linking.openURL('mailto:passwithabas@live.co.uk')} />
      <InfoRow icon="location" label="Address" value="76 Northgate, Wakefield" />
      <View style={{ marginTop: spacing.xl }}>
        <Text style={type.h1}>Settings</Text>
        <View style={{ marginTop: spacing.md }}>
          {['Notifications', 'Payment methods', 'Help & support', 'Terms & privacy'].map((label) => (
            <Pressable key={label} style={styles.settingsRow}>
              <Text style={type.body}>{label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.inkMuted} />
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
function InfoRow({ icon, label, value, onPress }) {
  const Wrapper = onPress ? Pressable : View;
  return (
    <Wrapper onPress={onPress} style={styles.infoRow}>
      <View style={styles.infoIcon}><Ionicons name={icon} size={18} color={colors.asphalt} /></View>
      <View><Text style={type.label}>{label}</Text><Text style={type.body}>{value}</Text></View>
    </Wrapper>
  );
}

/* --------------------------- NAVIGATION --------------------------- */
// A plain-state tab switcher (no external navigation library).
const TABS = [
  { key: 'Home', label: 'Home', icon: 'home' },
  { key: 'Instructors', label: 'Instructors', icon: 'people' },
  { key: 'Book', label: 'Book', icon: 'add-circle' },
  { key: 'MyLessons', label: 'My Lessons', icon: 'calendar' },
  { key: 'Profile', label: 'Profile', icon: 'person-circle' },
];

function AppShell() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('Home');
  const [bookInstructorId, setBookInstructorId] = useState(null);

  function onNavigate(screen, params) {
    if (screen === 'Book') setBookInstructorId(params?.instructorId ?? null);
    setActiveTab(screen);
  }

  let ScreenEl;
  if (activeTab === 'Home') ScreenEl = <HomeScreen onNavigate={onNavigate} />;
  else if (activeTab === 'Instructors') ScreenEl = <InstructorsScreen onNavigate={onNavigate} />;
  else if (activeTab === 'Book') ScreenEl = <BookLessonScreen presetInstructorId={bookInstructorId} onNavigate={onNavigate} />;
  else if (activeTab === 'MyLessons') ScreenEl = <MyLessonsScreen onNavigate={onNavigate} />;
  else ScreenEl = <ProfileScreen />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.cloud }}>
      <View style={{ flex: 1 }}>{ScreenEl}</View>
      <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        {TABS.map((tab) => {
          const active = tab.key === activeTab;
          return (
            <Pressable key={tab.key} style={styles.tabItem} onPress={() => onNavigate(tab.key)}>
              <Ionicons name={tab.icon} size={tab.key === 'Book' ? 30 : 22} color={active ? colors.go : colors.inkMuted} />
              <Text style={[styles.tabLabel, { color: active ? colors.go : colors.inkMuted }]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/* ------------------------------ APP ------------------------------ */
export default function App() {
  return (
    <SafeAreaProvider>
      <BookingProvider>
        <StatusBar style="light" />
        <AppShell />
      </BookingProvider>
    </SafeAreaProvider>
  );
}

/* ------------------------------ STYLES ------------------------------ */
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cloud },
  hero: { backgroundColor: colors.asphalt, paddingTop: 72, paddingBottom: spacing.xl, paddingHorizontal: spacing.lg, borderBottomLeftRadius: radius.lg, borderBottomRightRadius: radius.lg },
  heroKicker: { color: '#C7CDD6', fontWeight: '600', fontSize: 13, marginBottom: spacing.md },
  wordmark: { marginBottom: 2 },
  wordmarkWhite: { color: '#fff', fontSize: 34, fontWeight: '900', letterSpacing: -0.5 },
  wordmarkGreen: { color: colors.signal, fontSize: 34, fontWeight: '900', letterSpacing: -0.5 },
  wordmarkDark: { color: colors.ink, fontSize: 30, fontWeight: '900', letterSpacing: -0.5 },
  heroTitle: { color: '#fff', fontSize: 26, fontWeight: '800', lineHeight: 32, marginTop: spacing.sm },
  heroSub: { color: '#C7CDD6', fontSize: 15, marginTop: spacing.md, lineHeight: 21 },
  cta: { marginTop: spacing.lg, backgroundColor: colors.signal, borderRadius: radius.pill, paddingVertical: 14, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, alignSelf: 'flex-start' },
  ctaText: { fontWeight: '700', color: colors.asphalt, fontSize: 15 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.lg, marginTop: -spacing.lg },
  stat: { flex: 1, backgroundColor: colors.card, marginHorizontal: 4, borderRadius: radius.md, paddingVertical: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  section: { paddingHorizontal: spacing.lg, marginTop: spacing.xl },
  featureIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.go, alignItems: 'center', justifyContent: 'center' },
  secondaryCta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.card, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  btnBase: { paddingVertical: 14, paddingHorizontal: spacing.lg, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  btnPrimary: { backgroundColor: colors.signal },
  btnGhost: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.asphalt },
  btnDanger: { backgroundColor: colors.danger },
  btnLabel: { fontSize: 15, fontWeight: '700' },
  instructorCard: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center' },
  instructorCardSelected: { borderColor: colors.go, backgroundColor: colors.goLight },
  avatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  tag: { backgroundColor: colors.cloud, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.sm },
  tagText: { fontSize: 11, fontWeight: '600', color: colors.inkMuted },
  lessonCard: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  lessonIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.cloud, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  bookHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  stepper: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  stepDot: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  stepDotText: { fontSize: 12, fontWeight: '700', color: colors.inkMuted },
  stepLabel: { fontSize: 11, color: colors.inkMuted },
  optionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, padding: spacing.md, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border },
  optionCardSelected: { borderColor: colors.go, backgroundColor: colors.goLight },
  timeChip: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: radius.pill, backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border },
  summaryCard: { marginTop: spacing.md, backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  infoRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  infoIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.cloud, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  settingsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  tabBar: { flexDirection: 'row', backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8 },
  tabItem: { flex: 1, alignItems: 'center', gap: 2 },
  tabLabel: { fontSize: 11, fontWeight: '600' },
});
