import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL or Anon Key is missing. Database features may not work until configured in .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
        fetch: (url, options) => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s global timeout
            return fetch(url, {
                ...options,
                signal: controller.signal
            }).finally(() => clearTimeout(timeoutId));
        }
    }
});
