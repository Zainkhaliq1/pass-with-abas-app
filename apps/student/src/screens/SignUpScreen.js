import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { colors, spacing, type } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import TextField from '../components/TextField';
import PrimaryButton from '../components/PrimaryButton';

const EXPERIENCE_OPTIONS = ['Complete beginner', 'A few lessons before', 'Failed my test once', 'Failed my test a few times'];

export default function SignUpScreen({ navigation }) {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [experience, setExperience] = useState(EXPERIENCE_OPTIONS[0]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    if (!name || !address || !email || !password) {
      return Alert.alert('Missing details', 'Name, address, email and password are all required.');
    }
    if (password.length < 6) {
      return Alert.alert('Password too short', 'Use at least 6 characters.');
    }
    setLoading(true);
    try {
      const result = await signUp({ name, phone, address, experience, email: email.trim(), password });
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
        <Text style={[type.bodyMuted, { marginBottom: spacing.xl }]}>Tell us a bit about yourself to get started.</Text>

        <TextField label="Full name" value={name} onChangeText={setName} placeholder="Jordan Smith" />
        <TextField label="Phone" value={phone} onChangeText={setPhone} placeholder="07700 900000" keyboardType="phone-pad" />
        <TextField label="Address" value={address} onChangeText={setAddress} placeholder="Street, Wakefield" multiline />

        <Text style={type.label}>Driving experience</Text>
        <View style={styles.experienceRow}>
          {EXPERIENCE_OPTIONS.map((opt) => (
            <Pressable key={opt} onPress={() => setExperience(opt)} style={[styles.chip, experience === opt && styles.chipSelected]}>
              <Text style={[styles.chipText, experience === opt && styles.chipTextSelected]}>{opt}</Text>
            </Pressable>
          ))}
        </View>

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
  content: { padding: spacing.lg, paddingTop: 72, flexGrow: 1 },
  wordmark: { marginBottom: 2 },
  wordmarkDark: { color: colors.ink, fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  wordmarkGreen: { color: colors.signal, fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  experienceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: spacing.xs, marginBottom: spacing.md },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border },
  chipSelected: { backgroundColor: colors.go, borderColor: colors.go },
  chipText: { fontSize: 12, fontWeight: '600', color: colors.ink },
  chipTextSelected: { color: '#fff' },
});
