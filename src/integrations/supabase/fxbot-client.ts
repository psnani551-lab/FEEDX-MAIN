import { createClient } from '@supabase/supabase-js';

const fxbotSupabaseUrl = import.meta.env.VITE_FXBOT_SUPABASE_URL || '';
const fxbotSupabaseAnonKey = import.meta.env.VITE_FXBOT_SUPABASE_ANON_KEY || '';

if (!fxbotSupabaseUrl || !fxbotSupabaseAnonKey) {
    console.warn('FXBOT Supabase URL or Anon Key is missing. FXBOT features will not work until VITE_FXBOT_SUPABASE_URL and VITE_FXBOT_SUPABASE_ANON_KEY are configured in .env');
}

export const fxbotSupabase = createClient(fxbotSupabaseUrl, fxbotSupabaseAnonKey);
