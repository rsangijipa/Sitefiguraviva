import { api } from './api';

const BLOG_STORAGE_KEY = 'fv_blog_local';

const defaultPosts = [
    { id: 1, title: "A Fenomenologia do Encontro", slug: "a-fenomenologia-do-encontro", date: "12 Fev, 2024", excerpt: "Como a presença do terapeuta transforma o campo experiencial do cliente...", content: "Full content here..." },
    { id: 2, title: "Awareness no Cotidiano", slug: "awareness-no-cotidiano", date: "05 Fev, 2024", excerpt: "Práticas simples para cultivar a percepção consciente no dia a dia corrido...", content: "Full content here..." },
    { id: 3, title: "O Conceito de Ajustamento Criativo", slug: "o-conceito-de-ajustamento-criativo", date: "28 Jan, 2024", excerpt: "Entenda como nos adaptamos ao meio para satisfazer nossas necessidades...", content: "Full content here..." }
];

function getLocal() {
    const s = localStorage.getItem(BLOG_STORAGE_KEY);
    return s ? JSON.parse(s) : defaultPosts;
}

export const blogService = {
    getAll: async () => {
        try {
            return await api.get('/posts');
        } catch {
            return getLocal();
        }
    },
    getBySlug: async (slug) => {
        try {
            return await api.get(`/posts/${slug}`);
        } catch {
            const posts = getLocal();
            // Try matching slug, or id if slug fails (backward compatibility)
            return posts.find(p => p.slug === slug) || posts.find(p => p.id.toString() === slug);
        }
    }
};
