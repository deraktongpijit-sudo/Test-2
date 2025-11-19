import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
// Using process.env because we polyfilled it in vite.config.ts
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const isSupabaseConfigured = () => {
  return supabaseUrl.length > 0 && supabaseKey.length > 0;
};