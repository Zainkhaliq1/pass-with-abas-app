import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, SectionList, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, type } from '../theme/colors';
import { useInstructorData } from '../context/DataContext';
import PrimaryButton from '../components/PrimaryButton';

const TIME_OPTIONS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

// Next 14 days (today excluded — can't open a slot in the past).
function nextDays(n) {
  const out = [];
  const today = new Date();
  for (let i = 1; i <= n; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

export default function AvailabilityScreen() {
  const { slots, addSlot, removeSlot } = useInstructorData();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickedDate, setPickedDate] = useState(null);
  const [pickedTime, setPickedTime] = useState(null);
  const [saving, setSaving] = useState(false);

  const days = useMemo(() => nextDays(14), []);

  const sections = useMemo(() => {
    const byDate = {};
    slots.forEach((s) => {
      byDate[s.date] = byDate[s.date] || [];
      byDate[s.date].push(s);
    });
    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({ title: formatDate(date), data: data.sort((a, b) => a.time.localeCompare(b.time)) }));
  }, [slots]);

  async function handleAdd() {
    if (!pickedDate || !pickedTime) return Alert.alert('Pick a date and time first');
    const clash = slots.some((s) => s.date === pickedDate && s.time === pickedTime);
    if (clash) return Alert.alert('Already open', 'You already have a slot at that date and time.');
    setSaving(true);
    try {
      await addSlot(pickedDate, pickedTime);
      setPickerOpen(false);
      setPickedDate(null);
      setPickedTime(null);
    } catch (e) {
      Alert.alert('Could not add slot', e.message);
    } finally {
      setSaving(false);
    }
  }

  function handleRemove(slot) {
    if (slot.status !== 'open') {
      return Alert.alert('Already booked', 'Cancel the lesson from your Dashboard first to free this slot up.');
    }
    removeSlot(slot.id).catch((e) => Alert.alert('Could not remove', e.message));
  }

  return (
    <View style={styles.screen}>
      <SectionList
        contentContainerStyle={{ padding: spacing.lg, paddingTop: 64, flexGrow: 1 }}
        sections={sections}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={{ marginBottom: spacing.md }}>
            <Text style={type.display}>Your availability</Text>
            <Text style={type.bodyMuted}>Open the slots you're free for — pupils can only book what you add here.</Text>
            <PrimaryButton label={pickerOpen ? 'Cancel' : '+ Add a slot'} variant={pickerOpen ? 'ghost' : 'primary'} onPress={() => setPickerOpen((v) => !v)} />
            {pickerOpen && (
              <View style={styles.picker}>
                <Text style={type.label}>Date</Text>
                <View style={styles.wrapRow}>
                  {days.map((d) => (
                    <Pressable key={d} onPress={() => setPickedDate(d)} style={[styles.chip, pickedDate === d && styles.chipSelected]}>
                      <Text style={[styles.chipText, pickedDate === d && styles.chipTextSelected]}>{formatDate(d)}</Text>
                    </Pressable>
                  ))}
                </View>
                <Text style={[type.label, { marginTop: spacing.md }]}>Time</Text>
                <View style={styles.wrapRow}>
                  {TIME_OPTIONS.map((t) => (
                    <Pressable key={t} onPress={() => setPickedTime(t)} style={[styles.chip, pickedTime === t && styles.chipSelected]}>
                      <Text style={[styles.chipText, pickedTime === t && styles.chipTextSelected]}>{t}</Text>
                    </Pressable>
                  ))}
                </View>
                <View style={{ marginTop: spacing.md }}>
                  <PrimaryButton label="Save slot" onPress={handleAdd} loading={saving} disabled={!pickedDate || !pickedTime} />
                </View>
              </View>
            )}
          </View>
        }
        renderSectionHeader={({ section }) => <Text style={styles.sectionHeader}>{section.title}</Text>}
        renderItem={({ item }) => (
          <View style={styles.slotRow}>
            <Text style={type.body}>{item.time}</Text>
            <View style={styles.statusWrap}>
              <Text style={[styles.statusBadge, item.status === 'open' ? styles.statusOpen : styles.statusBooked]}>
                {item.status === 'open' ? 'Open' : 'Booked'}
              </Text>
              {item.status === 'open' && (
                <Pressable onPress={() => handleRemove(item)} hitSlop={8}>
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                </Pressable>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={!pickerOpen && <Text style={type.bodyMuted}>No slots open yet — add one above.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cloud },
  sectionHeader: { ...type.label, backgroundColor: colors.cloud, paddingVertical: spacing.sm },
  slotRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  statusWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  statusBadge: { fontSize: 11, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.sm, overflow: 'hidden' },
  statusOpen: { backgroundColor: colors.goLight, color: colors.go },
  statusBooked: { backgroundColor: colors.cloud, color: colors.inkMuted },
  picker: { marginTop: spacing.lg, backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.xs },
  chip: { paddingVertical: 7, paddingHorizontal: 11, borderRadius: 999, backgroundColor: colors.cloud, borderWidth: 1.5, borderColor: colors.border },
  chipSelected: { backgroundColor: colors.go, borderColor: colors.go },
  chipText: { fontSize: 12, fontWeight: '600', color: colors.ink },
  chipTextSelected: { color: '#fff' },
});
