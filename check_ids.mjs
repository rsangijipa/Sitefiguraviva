import { createClient } from '@supabase/supabase-js';
const supabaseUrl = "https://ponhrxfdfbzaronotelp.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvbmhyeGZkZmJ6YXJvbm90ZWxwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzA0NDYxNSwiZXhwIjoyMDgyNjIwNjE1fQ.0Pwy1Usmtc2UFCgBo4j4jvxFNDtEy2HPTeXLNFvt4F8";
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data, error } = await supabase.from('courses').select('id, title');
    console.log('Courses in DB:');
    console.log(JSON.stringify(data, null, 2));
    if (error) console.error(error);
}
check();
