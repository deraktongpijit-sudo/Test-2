import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Initialize Supabase client
// Using process.env because we polyfilled it in vite.config.ts
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

export const isSupabaseConfigured = () => {
  return !!supabaseUrl && !!supabaseKey;
};

// Prevent app crash if credentials are missing by exporting a dummy object if not configured.
// The dbService checks isSupabaseConfigured() before using this instance, so it's safe.
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl!, supabaseKey!)
  : ({} as SupabaseClient);
