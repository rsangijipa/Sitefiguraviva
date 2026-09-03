import { createServiceClient } from "./_supabase-client.mjs";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const supabase = createServiceClient();

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
