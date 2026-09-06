import { createServiceClient } from "./_supabase-client.mjs";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const supabase = createServiceClient();

async function populateBlog() {
    try {
        console.log('🧹 Limpando tabela de posts...');
        await supabase.from('posts').delete().neq('title', 'TEMP');

        const posts = [
            {
                title: "O Lugar da Mulher na Gestalt-Terapia",
                date: "15 de Outubro, 2024",
                excerpt: "Uma reflexão sobre a contribuição de Laura Perls e as perspectivas feministas na clínica contemporânea.",
                content: `
                    <p>A Gestalt-terapia, desde sua gênese, carrega marcas de uma presença feminina potente, porém muitas vezes silenciada. Laura Perls não foi apenas a 'parceira' de Fritz, mas a arquiteta de uma clínica pautada no suporte, na estética e no contato.</p>
                    <p>Revisitar esse lugar exige de nós, terapeutas contemporâneos, uma solidariedade política que atravesse as fronteiras de raça, gênero e classe.</p>
                `,
                author: "Lilian Vanessa",
                readingTime: "5 min",
                slug: "lugar-da-mulher-gestalt",
                type: "blog"
            },
            {
                title: "Fronteiras de Contato e Decolonialidade",
                date: "02 de Setembro, 2024",
                excerpt: "Como a prática clínica pode se tornar um ato de resistência e re-invenção da presença no mundo.",
                content: `
                    <p>Habitar a fronteira de contato é, antes de tudo, um ato ético. Em uma perspectiva decolonial, o encontro terapêutico deixa de ser uma técnica para se tornar uma travessia.</p>
                    <p>Trabalhar com o sofrimento ético-político nos convoca a des-aprender as certezas e a inaugurar um olhar sensível para o que emerge na relação.</p>
                `,
                author: "Lilian Vanessa",
                readingTime: "8 min",
                slug: "fronteiras-contato-decolonialidade",
                type: "blog"
            },
            {
                title: "Intervenção Precoce e Neurodiversidade",
                date: "20 de Agosto, 2024",
                excerpt: "Reflexões sobre o suporte clínico em crianças com autismo sob a ótica gestáltica.",
                content: `
                    <p>A neurodiversidade nos convida a repensar o conceito de 'ajustamento criativo'. No trabalho com crianças autistas, o foco desloca-se da correção para o encontro.</p>
                    <p>O Modelo Denver e outras abordagens, quando integradas à sensibilidade gestáltica, oferecem um campo fértil para o florescimento da linguagem e da socialização.</p>
                `,
                author: "Lilian Vanessa",
                readingTime: "10 min",
                slug: "intervencao-precoce-neurodiversidade",
                type: "blog"
            }
        ];

        console.log(`🚀 Inserindo ${posts.length} posts...`);
        for (const post of posts) {
            const { error } = await supabase.from('posts').insert([post]);
            if (error) {
                console.error(`❌ Erro em ${post.title}:`, error.message);
            } else {
                console.log(`✅ ${post.title} inserido.`);
            }
        }
        console.log('✨ Blog populado com sucesso!');
    } catch (err) {
        console.error('💥 Erro fatal:', err.message);
    }
}

populateBlog();
