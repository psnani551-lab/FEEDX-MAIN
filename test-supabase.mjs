import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tmyeaobdlxqmwcncxhlo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRteWVhb2JkbHhxbXdjbmN4aGxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwODExMDIsImV4cCI6MjA4NjY1NzEwMn0.gvZf0bhxuV-FRm_ajD60fwKt8j_9713xHVJfbkiUfAQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("Fetching institutes...");
  const { data, error } = await supabase.from('institutes').select('*');
  console.log("Error:", error);
  console.log("Data length:", data ? data.length : 0);
  console.log("First item:", data ? data[0] : null);
}

check();
