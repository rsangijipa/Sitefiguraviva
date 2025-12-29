import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COURSES_DIR = path.join(__dirname, '../public/cursos');
const OUTPUT_FILE = path.join(__dirname, '../src/data/courses.json');

// Ensure directory exists
if (!fs.existsSync(COURSES_DIR)) {
    console.log('Creating cursos directory...');
    fs.mkdirSync(COURSES_DIR, { recursive: true });
}

function parseCourseTxt(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const data = {
        title: '',
        category: 'Curso',
        status: 'Aberto',
        date: '',
        description: '',
        link: '',
        images: [],
        tags: [],
        mediators: [],
        details: {
            intro: '',
            format: [],
            schedule: []
        }
    };

    let currentSection = null;
    let mediatorBuffer = {}; // To parse "Name | Bio" or separate lines if we change format.
    // For now assuming existing format: "Mediador1: Name | Bio"

    lines.forEach(line => {
        const cleanLine = line.trim();

        // Key-Value pairs
        if (cleanLine.startsWith('Title:')) data.title = cleanLine.substring(6).trim();
        else if (cleanLine.startsWith('Subtitle:')) data.subtitle = cleanLine.substring(9).trim();
        else if (cleanLine.startsWith('Category:')) data.category = cleanLine.substring(9).trim();
        else if (cleanLine.startsWith('Status:')) data.status = cleanLine.substring(7).trim();
        else if (cleanLine.startsWith('Date:')) data.date = cleanLine.substring(5).trim();
        else if (cleanLine.startsWith('Link:')) data.link = cleanLine.substring(5).trim();
        else if (cleanLine.startsWith('Tags:')) data.tags = cleanLine.substring(5).split(',').map(t => t.trim()).filter(Boolean);

        // Mediators
        else if (cleanLine.startsWith('Mediador1:')) {
            const val = cleanLine.substring(10).trim();
            if (val) {
                const parts = val.split('|');
                data.mediators.push({ name: parts[0].trim(), bio: parts.slice(1).join('|').trim() }); // Join rest as bio if multiple |
            }
        }
        else if (cleanLine.startsWith('Mediador2:')) {
            const val = cleanLine.substring(10).trim();
            if (val) {
                const parts = val.split('|');
                data.mediators.push({ name: parts[0].trim(), bio: parts.slice(1).join('|').trim() });
            }
        }

        // Section Headers
        else if (cleanLine === 'Description:') currentSection = 'description';
        else if (cleanLine === 'Intro:') currentSection = 'intro';
        else if (cleanLine === 'Format:') currentSection = 'format';
        else if (cleanLine === 'Schedule:') currentSection = 'schedule'; // if used

        // Content Accumulation
        else if (cleanLine.length > 0 && !cleanLine.includes(':')) {
            if (currentSection === 'description') data.description += (data.description ? '\n' : '') + cleanLine;
            if (currentSection === 'intro') data.details.intro += (data.details.intro ? '\n' : '') + cleanLine;
            if (currentSection === 'format') data.details.format.push(cleanLine);
            if (currentSection === 'schedule') data.details.schedule.push(cleanLine);
        }
    });

    return data;
}

try {
    const folders = fs.readdirSync(COURSES_DIR, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    const courses = [];

    console.log(`Found ${folders.length} course folders in ${COURSES_DIR}`);

    folders.forEach(folder => {
        const folderPath = path.join(COURSES_DIR, folder);
        const infoPath = path.join(folderPath, 'info.txt');

        if (fs.existsSync(infoPath)) {
            console.log(`Processing ${folder}...`);
            const courseData = parseCourseTxt(infoPath);

            // Look for images in the folder
            const courseFiles = fs.readdirSync(folderPath);
            const allImages = courseFiles.filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));

            // 1. Handle Main Image (Cover)
            // Look for exact "capa.jpg" or "capa.jpeg" etc
            const coverImage = allImages.find(f => f.match(/^capa\.(jpg|jpeg|png|webp)$/i));
            if (coverImage) {
                courseData.image = `/cursos/${folder}/${coverImage}`;
            }

            // 2. Handle Mediator Images
            // Expecting mediador1.ext and mediador2.ext
            if (courseData.mediators && courseData.mediators.length > 0) {
                // Mediator 1
                const m1Image = allImages.find(f => f.match(/^mediador1\.(jpg|jpeg|png|webp)$/i));
                if (m1Image) {
                    courseData.mediators[0].image = `/cursos/${folder}/${m1Image}`;
                }

                // Mediator 2
                if (courseData.mediators.length > 1) {
                    const m2Image = allImages.find(f => f.match(/^mediador2\.(jpg|jpeg|png|webp)$/i));
                    if (m2Image) {
                        courseData.mediators[1].image = `/cursos/${folder}/${m2Image}`;
                    }
                }
            }

            // 3. Fallback / Gallery Images
            const imagePaths = allImages.map(f => `/cursos/${folder}/${f}`);
            courseData.images = imagePaths;

            // If no specific cover found, use first available image
            if (!courseData.image && imagePaths.length > 0) {
                courseData.image = imagePaths[0];
            }

            // Ensure 'image' property exists
            if (!courseData.image) courseData.image = '';

            courseData.id = folder; // Use folder name as ID
            courses.push(courseData);
        }
    });

    const content = JSON.stringify(courses, null, 2);
    fs.writeFileSync(OUTPUT_FILE, content);
    console.log(`Successfully generated courses.json with ${courses.length} items.`);

} catch (error) {
    console.error('Error syncing courses:', error);
}
