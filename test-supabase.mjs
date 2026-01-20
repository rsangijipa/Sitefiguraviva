import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from root .env if it exists
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase URL or Key missing in .env');
    process.exit(1);
}

console.log('Testing connection to:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    try {
        // Test fetching from 'posts' table
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .limit(1);

        if (error) {
            console.error('❌ Error connecting to Supabase (posts table):', error.message);
            console.error('Full error:', error);
        } else {
            console.log('✅ Successfully connected to Supabase!');
            console.log('Posts found:', data.length);
            if (data.length > 0) {
                console.log('Sample data:', data[0].title || data[0].id);
            }
        }

        // Test fetching from 'courses' table
        const { data: courses, error: coursesError } = await supabase
            .from('courses')
            .select('*')
            .limit(1);

        if (coursesError) {
            console.error('❌ Error connecting to Supabase (courses table):', coursesError.message);
        } else {
            console.log('✅ Courses table accessible! Courses found:', courses.length);
        }

    } catch (err) {
        console.error('❌ Unexpected error:', err.message);
    }
}

test();
