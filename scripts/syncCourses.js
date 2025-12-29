import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const CURSOS_DIR = path.join(PROJECT_ROOT, 'public', 'cursos');
const OUTPUT_FILE = path.join(PROJECT_ROOT, 'src', 'data', 'generatedCourses.json');

console.log(`Scanning directory: ${CURSOS_DIR}`);

// Helper to parse the txt file
function parseInstructions(content) {
    const lines = content.split('\n');
    const data = { format: [], mediators: [], tags: [] };
    let currentKey = null;

    lines.forEach((line, index) => {
        line = line.trim();
        if (!line) return;

        // Try to identify keys
        // Standard keys: Title:, Description:, etc.
        // Custom keys: 8) Link de inscrição:, Início das aulas:, etc.

        let foundKey = false;
        let value = '';

        const lowerLine = line.toLowerCase();

        if (lowerLine.startsWith('title:') || lowerLine.startsWith('título:')) {
            data.title = line.substring(line.indexOf(':') + 1).trim();
            foundKey = true;
        } else if (lowerLine.includes('link de inscrição') || lowerLine.startsWith('link:')) {
            data.link = line.substring(line.indexOf('http')).trim();
            foundKey = true;
        } else if (lowerLine.includes('início das aulas') || lowerLine.startsWith('date:') || lowerLine.startsWith('data:')) {
            data.date = line.substring(line.indexOf(':') + 1).trim();
            foundKey = true;
        } else if (lowerLine.startsWith('mediator:') || lowerLine.startsWith('mediador:')) {
            // Format: Mediador: Nome Sobrenome | Bio textual...
            const content = line.substring(line.indexOf(':') + 1).trim();
            const parts = content.split('|');
            const name = parts[0].trim();
            const bio = parts.length > 1 ? parts[1].trim() : '';

            data.mediators.push({ name, bio });
            foundKey = true;
        } else if (lowerLine.startsWith('description:') || lowerLine.startsWith('descrição:')) {
            data.description = line.substring(line.indexOf(':') + 1).trim();
            foundKey = true;
        } else if (lowerLine.startsWith('subtitle:') || lowerLine.startsWith('subtítulo:')) {
            data.subtitle = line.substring(line.indexOf(':') + 1).trim();
            foundKey = true;
        } else if (lowerLine.startsWith('tags:')) {
            data.tags = line.substring(line.indexOf(':') + 1).split(',').map(s => s.trim());
            foundKey = true;
        } else if (lowerLine.startsWith('intro:')) {
            data.intro = line.substring(line.indexOf(':') + 1).trim();
            foundKey = true;
        } else if (lowerLine.startsWith('format:') || lowerLine.startsWith('formato:')) {
            const fmt = line.substring(line.indexOf(':') + 1).trim();
            if (fmt.includes(';')) data.format = fmt.split(';').map(s => s.trim());
            else data.format.push(fmt);
            foundKey = true;
        } else if (lowerLine.includes('carga horária')) {
            data.format.push(line);
            foundKey = true;
        }

        // If it's the very first few lines and we haven't found a title yet, assumes it's the title
        if (!data.title && index < 5 && !foundKey && line.length > 10 && !line.includes('CAPA') && !line.match(/^\d+\)/)) {
            // Heuristic: If it looks like a title
            data.title = line;
        }

    });

    // Defaults if missing
    if (!data.category) {
        if (data.title && data.title.toLowerCase().includes('formação')) data.category = 'Formacao';
        else if (data.title && data.title.toLowerCase().includes('supervisão')) data.category = 'GrupoEstudos';
        else data.category = 'Curso';
    }

    return data;
}

async function syncCourses() {
    if (!fs.existsSync(CURSOS_DIR)) {
        console.error('Directory not found:', CURSOS_DIR);
        return;
    }

    const entries = fs.readdirSync(CURSOS_DIR, { withFileTypes: true });
    const courses = [];

    for (const entry of entries) {
        if (entry.isDirectory()) {
            const folderPath = path.join(CURSOS_DIR, entry.name);
            console.log(`Processing folder: ${entry.name}`);

            const files = fs.readdirSync(folderPath);

            // 1. Find Image
            const imageFile = files.find(f => /\.(jpg|jpeg|png|webp)$/i.test(f) && f.toLowerCase().includes('capa'));

            // 2. Find Instructions (detalhes.txt, instrucoes.txt, or informacoes.txt)
            const possibleNames = ['detalhes.txt', 'instrucoes.txt', 'informacoes.txt'];
            const txtFile = files.find(f => possibleNames.includes(f.toLowerCase()));

            if (txtFile) {
                const txtContent = fs.readFileSync(path.join(folderPath, txtFile), 'utf-8');
                const parsedData = parseInstructions(txtContent);

                // Construct Course Object
                const courseId = entry.name.toLowerCase().replace(/\s+/g, '-');

                const course = {
                    id: courseId,
                    title: parsedData.title || entry.name,
                    subtitle: parsedData.subtitle || '',
                    category: parsedData.category || 'Curso',
                    status: parsedData.status || 'Aberto',
                    date: parsedData.date || '',
                    description: parsedData.description || '',
                    link: parsedData.link || '',
                    image: imageFile ? `/cursos/${entry.name}/${imageFile}` : '',
                    images: imageFile ? [`/cursos/${entry.name}/${imageFile}`] : [],
                    mediators: parsedData.mediators || [],
                    tags: parsedData.tags || [],
                    details: {
                        intro: parsedData.intro || '',
                        format: parsedData.format || [],
                        schedule: parsedData.schedule ? parsedData.schedule.split(';') : []
                    }
                };

                courses.push(course);
                console.log(`  > Added course: ${course.title} (${course.id})`);
            } else {
                console.warn(`  > Skipping ${entry.name}: No .txt file found.`);
            }
        }
    }

    // Write to JSON
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(courses, null, 2));
    console.log(`\nSuccessfully generated ${courses.length} courses to ${OUTPUT_FILE}`);
}

syncCourses();
