import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { colors, spacing, type } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import TextField from '../components/TextField';
import PrimaryButton from '../components/PrimaryButton';

export default function SignInScreen({ navigation }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    if (!email || !password) return Alert.alert('Missing details', 'Enter your email and password.');
    setLoading(true);
    try {
      await signIn({ email: email.trim(), password });
    } catch (e) {
      Alert.alert('Could not sign in', e.message);
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
        <Text style={[type.bodyMuted, { marginBottom: spacing.xl }]}>Welcome back. Sign in to book your next lesson.</Text>

        <TextField label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
        <TextField label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />

        <PrimaryButton label="Sign in" onPress={handleSignIn} loading={loading} />

        <Pressable style={{ marginTop: spacing.lg, alignItems: 'center' }} onPress={() => navigation.navigate('SignUp')}>
          <Text style={type.bodyMuted}>New here? <Text style={{ color: colors.go, fontWeight: '700' }}>Create an account</Text></Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cloud },
  content: { padding: spacing.lg, paddingTop: 80, flexGrow: 1 },
  wordmark: { marginBottom: 2 },
  wordmarkDark: { color: colors.ink, fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  wordmarkGreen: { color: colors.signal, fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
});
