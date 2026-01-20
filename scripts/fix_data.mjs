import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = "https://ponhrxfdfbzaronotelp.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvbmhyeGZkZmJ6YXJvbm90ZWxwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzA0NDYxNSwiZXhwIjoyMDgyNjIwNjE1fQ.0Pwy1Usmtc2UFCgBo4j4jvxFNDtEy2HPTeXLNFvt4F8";

const supabase = createClient(supabaseUrl, supabaseKey);

const coursesJsonPath = path.resolve(__dirname, '../../src/data/courses.json');

async function cleanAndPopulate() {
    try {
        console.log('🧹 Limpando tabela de cursos...');
        // Deletar tudo
        const { error: deleteError } = await supabase.from('courses').delete().neq('title', 'DELETAR_TUDO_TEMP');
        if (deleteError) console.warn('Delete warning (might be empty):', deleteError.message);

        console.log('📖 Lendo courses.json...');
        const courses = JSON.parse(fs.readFileSync(coursesJsonPath, 'utf-8'));

        console.log(`🚀 Inserindo ${courses.length} cursos...`);
        for (const course of courses) {
            const payload = {
                title: course.title,
                subtitle: course.subtitle || '',
                date: course.date || '',
                status: course.status || 'Aberto',
                image: course.image || '',
                link: course.link || '',
                description: course.description || '',
                tags: course.tags || [],
                mediators: course.mediators || [],
                details: course.details || {}
            };

            const { error: insertError } = await supabase.from('courses').insert([payload]);
            if (insertError) {
                console.error(`❌ Erro em ${course.title}:`, insertError.message);
            } else {
                console.log(`✅ ${course.title} inserido.`);
            }
        }
        console.log('✨ Concluído!');
    } catch (err) {
        console.error('💥 Erro fatal:', err.message);
    }
}

cleanAndPopulate();
