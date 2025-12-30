import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Configuração de caminhos para ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

// Carregar variáveis de ambiente
dotenv.config({ path: path.resolve(PROJECT_ROOT, '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Erro: Variáveis de ambiente do Supabase não encontradas.');
    console.error('Certifique-se de ter NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (recomendado) ou NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY no arquivo .env.local');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Função auxiliar para parsear arquivos chave-valor (info.txt)
const parseInfoFile = (content) => {
    const lines = content.split('\n');
    const data = {};
    let currentKey = null;

    lines.forEach(line => {
        if (line.includes(':') && !currentKey) {
            const [key, ...value] = line.split(':');
            currentKey = key.trim().toLowerCase();
            data[currentKey] = value.join(':').trim();
        } else if (line.trim() === '') {
            currentKey = null;
        } else if (currentKey) {
            data[currentKey] += '\n' + line.trim();
        }
    });
    return data;
};

// Função para sanitizar nomes de arquivos/pastas para Storage
const sanitizeKey = (key) => {
    return key.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9.-]/g, '_');
};

// Função para upload de arquivo
const uploadFile = async (filePath, bucket, folder = '') => {
    try {
        const fileContent = await fs.readFile(filePath);
        const fileName = path.basename(filePath);
        const sanitizedFileName = sanitizeKey(fileName);
        const sanitizedFolder = folder ? sanitizeKey(folder) : '';
        
        const storagePath = sanitizedFolder ? `${sanitizedFolder}/${sanitizedFileName}` : sanitizedFileName;

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(storagePath, fileContent, { upsert: true });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(storagePath);

        return publicUrl;
    } catch (error) {
        console.error(`Erro no upload de ${filePath}:`, error.message);
        return null;
    }
};

async function seedCourses() {
    console.log('\n📚 Iniciando migração de Cursos...');
    const coursesDir = path.resolve(PROJECT_ROOT, '../public/cursos');
    
    try {
        const entries = await fs.readdir(coursesDir, { withFileTypes: true });
        const courseDirs = entries.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);

        for (const dirName of courseDirs) {
            const dirPath = path.join(coursesDir, dirName);
            const infoPath = path.join(dirPath, 'info.txt');

            try {
                const infoContent = await fs.readFile(infoPath, 'utf-8');
                const info = parseInfoFile(infoContent);

                // Upload da capa
                const capaPath = path.join(dirPath, 'capa.jpeg');
                let imageUrl = null;
                if (await fs.stat(capaPath).catch(() => false)) {
                    imageUrl = await uploadFile(capaPath, 'courses', dirName);
                }

                // Preparar objeto do curso
                const courseData = {
                    title: info.title || dirName,
                    date: info.date,
                    status: info.status || 'Aberto',
                    link: info.link,
                    image: imageUrl,
                    description: info.description,
                    // Mapear outros campos se necessário
                };

                // Inserir no banco
                const { error } = await supabase
                    .from('courses')
                    .insert([courseData]);

                if (error) console.error(`Erro ao inserir curso ${dirName}:`, error.message);
                else console.log(`✅ Curso migrado: ${dirName}`);

            } catch (err) {
                console.warn(`⚠️ Pulando ${dirName}: info.txt não encontrado ou erro de leitura.`);
            }
        }
    } catch (err) {
        console.error('Erro ao ler diretório de cursos:', err);
    }
}

async function seedGallery() {
    console.log('\n🖼️ Iniciando migração da Galeria...');
    const imagesDir = path.resolve(PROJECT_ROOT, '../public/images');

    try {
        const files = await fs.readdir(imagesDir);
        const imageFiles = files.filter(f => f.match(/\.(png|jpg|jpeg)$/i));

        for (const imgFile of imageFiles) {
            const txtFile = `${imgFile}.txt`;
            const txtPath = path.join(imagesDir, txtFile);
            const imgPath = path.join(imagesDir, imgFile);

            let metadata = {};
            if (await fs.stat(txtPath).catch(() => false)) {
                const txtContent = await fs.readFile(txtPath, 'utf-8');
                metadata = parseInfoFile(txtContent);
            }

            // Upload da imagem
            const publicUrl = await uploadFile(imgPath, 'gallery');

            if (publicUrl) {
                const tagsString = metadata.tags || '';
                // Convert to array for Supabase (assuming text[] column based on previous error)
                // If the column is text, Supabase client might stringify it, which is acceptable.
                const tagsArray = tagsString ? tagsString.split(',').map(t => t.trim()) : [];

                const galleryItem = {
                    title: metadata.title || 'Sem título',
                    src: publicUrl,
                    caption: metadata.legend || metadata.caption || '',
                    tags: tagsString // Fallback
                };
                
                // Use array for tags
                galleryItem.tags = tagsArray.length > 0 ? tagsArray : null;

                const { error } = await supabase
                    .from('gallery')
                    .insert([galleryItem]);

                if (error) console.error(`Erro ao inserir imagem ${imgFile}:`, error.message);
                else console.log(`✅ Imagem migrada: ${imgFile}`);
            }
        }
    } catch (err) {
        console.error('Erro ao ler diretório de imagens:', err);
    }
}

async function main() {
    await seedCourses();
    await seedGallery();
    console.log('\n✨ Migração concluída!');
}

main();
