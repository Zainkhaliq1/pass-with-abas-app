import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { colors, spacing, type } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import TextField from '../components/TextField';
import PrimaryButton from '../components/PrimaryButton';

const TRANSMISSIONS = ['Manual', 'Automatic'];

export default function SignUpScreen({ navigation }) {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [car, setCar] = useState('');
  const [transmission, setTransmission] = useState(['Manual']);
  const [yearsExperience, setYearsExperience] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  function toggleTransmission(t) {
    setTransmission((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  async function handleSignUp() {
    if (!name || !car || transmission.length === 0 || !email || !password) {
      return Alert.alert('Missing details', 'Fill in your name, car, transmission, email and password.');
    }
    if (password.length < 6) {
      return Alert.alert('Password too short', 'Use at least 6 characters.');
    }
    setLoading(true);
    try {
      const result = await signUp({
        name, car, transmission,
        yearsExperience: yearsExperience ? parseInt(yearsExperience, 10) : null,
        email: email.trim(), password,
      });
      if (result.needsEmailConfirmation) {
        Alert.alert('Check your email', 'Confirm your email address, then sign in.', [
          { text: 'OK', onPress: () => navigation.navigate('SignIn') },
        ]);
      }
    } catch (e) {
      Alert.alert('Could not sign up', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.wordmark}>
          <Text style={styles.wordmarkDark}>Pass With </Text>
          <Text style={styles.wordmarkGreen}>Abas</Text>
        </Text>
        <Text style={styles.staffLabel}>STAFF SIGN-UP</Text>
        <Text style={[type.bodyMuted, { marginBottom: spacing.lg }]}>
          Only create an account here if you're a real instructor — you'll appear as bookable in the student app.
        </Text>

        <TextField label="Full name" value={name} onChangeText={setName} placeholder="As pupils should see it" />
        <TextField label="Car" value={car} onChangeText={setCar} placeholder="e.g. Toyota Yaris Hybrid" />

        <Text style={type.label}>Transmission you teach</Text>
        <View style={styles.row}>
          {TRANSMISSIONS.map((t) => {
            const selected = transmission.includes(t);
            return (
              <Pressable key={t} onPress={() => toggleTransmission(t)} style={[styles.chip, selected && styles.chipSelected]}>
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{t}</Text>
              </Pressable>
            );
          })}
        </View>

        <TextField label="Years of experience (optional)" value={yearsExperience} onChangeText={setYearsExperience} placeholder="e.g. 3" keyboardType="number-pad" />

        <View style={{ marginTop: spacing.md }}>
          <TextField label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
          <TextField label="Password" value={password} onChangeText={setPassword} placeholder="At least 6 characters" secureTextEntry />
        </View>

        <PrimaryButton label="Create account" onPress={handleSignUp} loading={loading} />

        <Pressable style={{ marginTop: spacing.lg, alignItems: 'center' }} onPress={() => navigation.navigate('SignIn')}>
          <Text style={type.bodyMuted}>Already have an account? <Text style={{ color: colors.go, fontWeight: '700' }}>Sign in</Text></Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cloud },
  content: { padding: spacing.lg, paddingTop: 64, flexGrow: 1 },
  wordmark: { marginBottom: 2 },
  wordmarkDark: { color: colors.ink, fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  wordmarkGreen: { color: colors.signal, fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  staffLabel: { color: colors.go, fontWeight: '800', fontSize: 12, letterSpacing: 1, marginTop: 4, marginBottom: spacing.sm },
  row: { flexDirection: 'row', gap: 8, marginTop: spacing.xs, marginBottom: spacing.md },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border },
  chipSelected: { backgroundColor: colors.go, borderColor: colors.go },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.ink },
  chipTextSelected: { color: '#fff' },
});
