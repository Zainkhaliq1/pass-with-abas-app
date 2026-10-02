import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null); // row from public.pupils
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null);
      return;
    }
    const { data, error } = await supabase.from('pupils').select('*').eq('id', userId).maybeSingle();
    if (error) console.warn('Could not load pupil profile', error.message);
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

  const signUp = useCallback(async ({ name, phone, address, experience, email, password }) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    const userId = data.user?.id;
    if (!userId) {
      // Email confirmation is required before a session exists — the pupil
      // row gets created on first sign-in instead (see signIn below).
      return { needsEmailConfirmation: true };
    }
    const { error: profileError } = await supabase
      .from('pupils')
      .insert({ id: userId, name, phone, address, experience });
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
    <AuthContext.Provider value={{ session, profile, loading, signUp, signIn, signOut, reloadProfile: () => loadProfile(session?.user?.id) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
