const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://ponhrxfdfbzaronotelp.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvbmhyeGZkZmJ6YXJvbm90ZWxwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzA0NDYxNSwiZXhwIjoyMDgyNjIwNjE1fQ.0Pwy1Usmtc2UFCgBo4j4jvxFNDtEy2HPTeXLNFvt4F8";
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: courses, error } = await supabase.from('courses').select('*');
    if (error) {
        console.error(error);
        return;
    }
    console.log('--- COURSES DETAIL ---');
    courses.forEach(c => {
        console.log(`ID: ${c.id}`);
        console.log(`Title: ${c.title}`);
        console.log(`Subtitle: ${c.subtitle}`);
        console.log(`Image: ${c.image}`);
        console.log(`Status: ${c.status}`);
        console.log('-------------------------');
    });
}
check();
