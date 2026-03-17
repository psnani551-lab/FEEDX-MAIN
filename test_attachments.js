import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_FXBOT_SUPABASE_URL,
  process.env.VITE_FXBOT_SUPABASE_ANON_KEY
);

async function check() {
  console.log("Checking issue_attachments for FX-ISS-9431...");
  const { data, error } = await supabase
    .from('issue_attachments')
    .select('*')
    .eq('issue_id', 'FX-ISS-9431');
  
  if (error) {
    console.error("Error:", error.message);
  } else {
    console.log(`Found ${data.length} attachments:`);
    console.log(data);
  }
}
check();
