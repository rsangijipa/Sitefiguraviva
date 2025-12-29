import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGES_DIR = path.join(__dirname, '../public/images');
const OUTPUT_FILE = path.join(__dirname, '../src/data/gallery.json');

// Ensure directory exists
if (!fs.existsSync(IMAGES_DIR)) {
    console.log('Creating images directory...');
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

function parseTxtFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const data = {
        title: '',
        tags: [],
        caption: '' // We store 'Legend' as 'caption' for frontend compatibility
    };

    lines.forEach(line => {
        const cleanLine = line.trim();
        if (cleanLine.startsWith('Title:')) {
            data.title = cleanLine.substring(6).trim();
        } else if (cleanLine.startsWith('Tags:')) {
            // Support comma separated tags
            data.tags = cleanLine.substring(5).split(',').map(t => t.trim()).filter(Boolean);
        } else if (cleanLine.startsWith('Legend:')) {
            data.caption = cleanLine.substring(7).trim();
        } else if (cleanLine.startsWith('Caption:')) {
            // Fallback for older files if any
            data.caption = cleanLine.substring(8).trim();
        } else if (!line.includes(':') && data.caption && cleanLine.length > 0) {
            // Append continuation of legend/caption
            data.caption += ' ' + cleanLine;
        }
    });

    return data;
}

try {
    // Read directory
    const files = fs.readdirSync(IMAGES_DIR);
    const galleryItems = [];

    // Filter for image files
    const imageFiles = files.filter(file =>
        /\.(jpg|jpeg|png|webp|gif)$/i.test(file)
    );

    console.log(`Found ${imageFiles.length} images in ${IMAGES_DIR}`);

    imageFiles.forEach(imageFile => {
        let txtPath = path.join(IMAGES_DIR, imageFile + '.txt');
        if (!fs.existsSync(txtPath)) {
            // Try removing extension: photo.jpg -> photo.txt
            const nameWithoutExt = path.parse(imageFile).name;
            const altPath = path.join(IMAGES_DIR, nameWithoutExt + '.txt');
            if (fs.existsSync(altPath)) {
                txtPath = altPath;
            }
        }

        // Default metadata
        let meta = {
            title: imageFile,
            tags: ['Galeria'],
            caption: ''
        };

        if (fs.existsSync(txtPath)) {
            console.log(`Processing metadata for ${imageFile}...`);
            const parsed = parseTxtFile(txtPath);
            // Merge parsed data, overwriting defaults if they exist
            if (parsed.title) meta.title = parsed.title;
            if (parsed.tags.length > 0) meta.tags = parsed.tags;
            if (parsed.caption) meta.caption = parsed.caption;
        }

        galleryItems.push({
            id: imageFile,
            src: `/images/${imageFile}`,
            ...meta
        });
    });

    // Write to JSON
    const content = JSON.stringify(galleryItems, null, 2);
    fs.writeFileSync(OUTPUT_FILE, content);
    console.log(`Successfully generated gallery.json with ${galleryItems.length} items.`);

} catch (error) {
    console.error('Error syncing gallery:', error);
}
