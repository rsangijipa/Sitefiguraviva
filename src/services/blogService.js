import { api } from './api';

const mockPosts = [
    { id: 1, title: "A Fenomenologia do Encontro", date: "12 Fev, 2024", excerpt: "Como a presença do terapeuta transforma o campo experiencial do cliente...", content: "Full content here..." },
    { id: 2, title: "Awareness no Cotidiano", date: "05 Fev, 2024", excerpt: "Práticas simples para cultivar a percepção consciente no dia a dia corrido...", content: "Full content here..." },
    { id: 3, title: "O Conceito de Ajustamento Criativo", date: "28 Jan, 2024", excerpt: "Entenda como nos adaptamos ao meio para satisfazer nossas necessidades...", content: "Full content here..." }
];

export const blogService = {
    getAll: async () => {
        try {
            return await api.get('/posts');
        } catch {
            return mockPosts;
        }
    },
    getBySlug: async (slug) => {
        // In a real app, this would be a filtered API call
        return mockPosts.find(p => p.id.toString() === slug);
    }
};
