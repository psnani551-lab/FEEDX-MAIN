import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_FXBOT_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_FXBOT_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  console.log("Sending OTP...");
  const { data, error } = await supabase.auth.signInWithOtp({
    email: 'mytestuser555@gmail.com',
    options: {
      shouldCreateUser: true
    }
  });
  console.log("Send:", { data, error });
}

test();
