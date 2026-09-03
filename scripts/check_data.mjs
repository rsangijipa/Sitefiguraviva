import { createServiceClient } from "./_supabase-client.mjs";


const supabase = createServiceClient();

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
