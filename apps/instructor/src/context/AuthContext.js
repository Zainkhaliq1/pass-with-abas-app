import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null); // row from public.instructors
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null);
      return;
    }
    const { data, error } = await supabase.from('instructors').select('*').eq('id', userId).maybeSingle();
    if (error) console.warn('Could not load instructor profile', error.message);
    setProfile(data || null);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      loadProfile(data.session?.user?.id).finally(() => setLoading(false));
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      loadProfile(newSession?.user?.id);
    });

    return () => listener.subscription.unsubscribe();
  }, [loadProfile]);

  // NOTE: this sign-up creates a row in `instructors`, which the student app
  // treats as a real member of staff. Only share this app's sign-up with
  // people who actually work at Pass With Abas — anyone who creates an
  // account here will show up as a bookable instructor.
  const signUp = useCallback(async ({ name, car, transmission, yearsExperience, email, password }) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    const userId = data.user?.id;
    if (!userId) {
      return { needsEmailConfirmation: true };
    }
    const { error: profileError } = await supabase
      .from('instructors')
      .insert({ id: userId, name, car, transmission, years_experience: yearsExperience || null });
    if (profileError) throw profileError;
    await loadProfile(userId);
    return { needsEmailConfirmation: false };
  }, [loadProfile]);

  const signIn = useCallback(async ({ email, password }) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider value={{ session, profile, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
