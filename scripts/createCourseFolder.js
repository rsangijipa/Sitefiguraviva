import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const CURSOS_DIR = path.join(PROJECT_ROOT, 'public', 'cursos');

const courseName = process.argv[2];

if (!courseName) {
    console.error('Por favor, forneça o nome do curso.');
    console.error('Uso: node scripts/createCourseFolder.js "Nome do Curso"');
    process.exit(1);
}

const folderPath = path.join(CURSOS_DIR, courseName);

if (fs.existsSync(folderPath)) {
    console.error(`A pasta "${courseName}" já existe.`);
    process.exit(1);
}

// Create Directory
fs.mkdirSync(folderPath, { recursive: true });

// Create instructions.txt template
const template = `Title: ${courseName}
Subtitle: 
Category: Curso
Status: Aberto
Mediators: 
Tags: Online, Ao Vivo
Description: Descrição do curso...
Date: Início em...
Link: https://
Intro: Introdução curta...
Format: Item 1; Item 2
`;

fs.writeFileSync(path.join(folderPath, 'detalhes.txt'), template);

// Create placeholder dummy image if needed, or just warn
console.log(`\n✅ Pasta criada com sucesso: ${folderPath}`);
console.log(`📄 Arquivo 'detalhes.txt' criado.`);
console.log(`⚠️ Lembre-se de adicionar uma imagem 'capa.jpg' nesta pasta.`);
console.log(`\nDepois de preencher os dados, rode: node scripts/syncCourses.js`);
