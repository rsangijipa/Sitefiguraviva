import { api } from './api';

// Initial mock data as fallback
const mockCourses = [
    { id: 1, title: "Formação em Gestalt-Terapia", date: "Início Março/2024", status: "Aberto", image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1000", link: "#" },
    { id: 2, title: "Workshop: O Corpo na Clínica", date: "15 de Abril, 19h", status: "Aberto", image: "https://images.unsplash.com/photo-1516302752625-fbc3c8c1fa6d?auto=format&fit=crop&q=80&w=1000", link: "#" },
    { id: 3, title: "Grupo de Estudos: Heidegger", date: "Sábados, Quinzenal", status: "Esgotado", image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=1000", link: "#" }
];

export const courseService = {
    getAll: async () => {
        try {
            return await api.get('/courses');
        } catch {
            return mockCourses; // Fallback
        }
    },
    getById: async (id) => {
        try {
            return await api.get(`/courses/${id}`);
        } catch {
            return mockCourses.find(c => c.id === parseInt(id));
        }
    },
    create: (data) => api.post('/courses', data),
    update: (id, data) => api.put(`/courses/${id}`, data),
    delete: (id) => api.delete(`/courses/${id}`),
};
