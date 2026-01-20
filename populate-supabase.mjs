import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from root .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Use the secret key provided by the user
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl) {
    console.error('❌ Supabase URL missing in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const coursesJsonPath = path.resolve(__dirname, '../src/data/courses.json');

async function populate() {
    try {
        if (!fs.existsSync(coursesJsonPath)) {
            console.error('❌ src/data/courses.json not found.');
            return;
        }

        const courses = JSON.parse(fs.readFileSync(coursesJsonPath, 'utf-8'));
        console.log(`Found ${courses.length} courses to populate.`);

        for (const course of courses) {
            console.log(`🚀 Processing: ${course.title}`);

            // Since ID is UUID and we have strings, we OMIT 'id' to let Supabase generate it
            // OR if 'id' must be the slug, we hope columns were changed to TEXT.
            // Let's try OMITTING 'id' first to see if it inserts as new records.
            // Actually, usually users want the slug in a 'slug' column if id is UUID.
            // I'll try to insert without ID first.

            const payload = {
                title: course.title,
                subtitle: course.subtitle || '',
                date: course.date || '',
                status: course.status || 'Aberto',
                image: course.image || '',
                images: course.images || [],
                description: course.description || '',
                category: course.category || 'Curso',
                link: course.link || '',
                tags: course.tags || [],
                mediators: course.mediators || [],
                details: course.details || {}
            };

            const { data, error } = await supabase
                .from('courses')
                .insert([payload]);

            if (error) {
                console.error(`❌ Error inserting ${course.title}:`, error.message);
                console.error('Code:', error.code);
            } else {
                console.log(`✅ ${course.title} inserted successfully.`);
            }
        }

    } catch (err) {
        console.error('❌ Unexpected error:', err.message);
    }
}

populate();
