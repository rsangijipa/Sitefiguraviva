const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://ponhrxfdfbzaronotelp.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvbmhyeGZkZmJ6YXJvbm90ZWxwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzA0NDYxNSwiZXhwIjoyMDgyNjIwNjE1fQ.0Pwy1Usmtc2UFCgBo4j4jvxFNDtEy2HPTeXLNFvt4F8";

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: courses, error: err1 } = await supabase.from('courses').select('id, title');
    console.log('--- COURSES ---');
    console.log(JSON.stringify(courses, null, 2));

    const { data: posts, error: err2 } = await supabase.from('posts').select('id, title');
    console.log('--- POSTS ---');
    console.log(JSON.stringify(posts, null, 2));
}

check();
