const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('/Volumes/NANI_1/FEEDX-MAIN-main/.env.production', 'utf8');
const lines = envFile.split('\n');
const supabaseUrl = lines.find(l => l.startsWith('VITE_SUPABASE_URL=')).split('=')[1].replace(/'/g, "").trim();
const supabaseKey = lines.find(l => l.startsWith('VITE_SUPABASE_ANON_KEY=')).split('=')[1].replace(/'/g, "").trim();

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const { data: inst, error } = await supabase.from('institutes').select('*').limit(1);
    if (error) {
        console.error("Query Error:", error.message);
    } else if (inst && inst.length > 0) {
        console.log("Keys in table mapping:", Object.keys(inst[0]));
        console.log("Full Object:", JSON.stringify(inst[0], null, 2));
    } else {
        console.log("Table is empty but exists.");
    }
}
run();
