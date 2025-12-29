import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const folderName = process.argv[2];

if (!folderName) {
    console.error('Please provide a folder name to delete.');
    process.exit(1);
}

const COURSES_DIR = path.join(__dirname, '../public/cursos');
const targetPath = path.join(COURSES_DIR, folderName);

try {
    if (fs.existsSync(targetPath)) {
        fs.rmSync(targetPath, { recursive: true, force: true });
        console.log(`Successfully deleted folder: ${targetPath}`);

        // Run sync
        const syncScript = path.join(__dirname, 'syncCourses.js');
        exec(`node "${syncScript}"`, (err, stdout, stderr) => {
            if (err) {
                console.error('Error syncing after delete:', stderr);
            } else {
                console.log('Sync output:', stdout);
            }
        });
    } else {
        console.warn(`Folder not found: ${targetPath}`);
    }
} catch (error) {
    console.error(`Error deleting folder ${folderName}:`, error);
    process.exit(1);
}
