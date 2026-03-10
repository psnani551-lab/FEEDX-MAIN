const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('/Volumes/NANI_1/FEEDX-MAIN-main/.env.production', 'utf8');
const lines = envFile.split('\n');
const supabaseUrl = lines.find(l => l.startsWith('VITE_SUPABASE_URL=')).split('=')[1].replace(/'/g, "").trim();
const supabaseKey = lines.find(l => l.startsWith('VITE_SUPABASE_ANON_KEY=')).split('=')[1].replace(/'/g, "").trim();

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const { data: events } = await supabase.from('events').select('title, image').ilike('title', '%Essay Writing%');
    console.log(JSON.stringify(events, null, 2));
}

run();
