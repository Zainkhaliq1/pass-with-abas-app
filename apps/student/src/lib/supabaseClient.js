// Shared Supabase client for the Pass With Abas student app.
//
// The URL + key below are the project's public "publishable"/anon key —
// this is DESIGNED to be embedded in client apps (unlike a service_role
// key, which must never appear in app code). Real security comes from the
// Row Level Security policies in supabase/schema.sql, not from hiding
// this key.
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://geplhlxmzcnzdrdktwyg.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_Aa_3C6ZqzBznb5DxZDQ1aA_ByHtyaNt';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
