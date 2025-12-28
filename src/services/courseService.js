import { api } from './api';

const COURSE_STORAGE_KEY = 'fv_courses_local';

const defaultCourses = [
    { id: 1, title: "Formação em Gestalt-Terapia", date: "Início Março/2024", status: "Aberto", image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1000", link: "#" },
    { id: 2, title: "Workshop: O Corpo na Clínica", date: "15 de Abril, 19h", status: "Aberto", image: "https://images.unsplash.com/photo-1516302752625-fbc3c8c1fa6d?auto=format&fit=crop&q=80&w=1000", link: "#" },
    { id: 3, title: "Grupo de Estudos: Heidegger", date: "Sábados, Quinzenal", status: "Esgotado", image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=1000", link: "#" }
];

function getLocal() {
    const s = localStorage.getItem(COURSE_STORAGE_KEY);
    return s ? JSON.parse(s) : defaultCourses;
}

function setLocal(data) {
    localStorage.setItem(COURSE_STORAGE_KEY, JSON.stringify(data));
}

export const courseService = {
    getAll: async () => {
        try {
            return await api.get('/courses');
        } catch {
            console.warn("API unavailable, using local mock data");
            return getLocal();
        }
    },
    getById: async (id) => {
        try {
            return await api.get(`/courses/${id}`);
        } catch {
            const courses = getLocal();
            return courses.find(c => c.id === parseInt(id) || c.id === id);
        }
    },
    create: async (data) => {
        try {
            return await api.post('/courses', data);
        } catch {
            const courses = getLocal();
            const newCourse = { ...data, id: Date.now() };
            setLocal([...courses, newCourse]);
            return newCourse;
        }
    },
    update: async (id, data) => {
        try {
            return await api.put(`/courses/${id}`, data);
        } catch {
            const courses = getLocal();
            const updated = courses.map(c => (c.id === id || c.id === parseInt(id)) ? { ...c, ...data } : c);
            setLocal(updated);
            return { ...data, id };
        }
    },
    delete: async (id) => {
        try {
            return await api.delete(`/courses/${id}`);
        } catch {
            const courses = getLocal();
            const filtered = courses.filter(c => c.id !== id && c.id !== parseInt(id));
            setLocal(filtered);
            return true;
        }
    },
};
