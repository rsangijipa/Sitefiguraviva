import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { courseService } from '../services/courseService';
import { blogService } from '../services/blogService';
import { configService } from '../services/configService';
import { authService } from '../services/authService';

const AppContext = createContext();

export function AppProvider({ children }) {
    const [courses, setCourses] = useState([]);
    const [blogPosts, setBlogPosts] = useState([]);
    const [googleConfig, setGoogleConfig] = useState(configService.get());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ...

    const [alertMessage, setAlertMessage] = useState(() => {
        return localStorage.getItem('alertMessage') || "Bem-vindos ao Instituto Figura Viva";
    });

    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return authService.isAuthenticated();
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        const pdfItem = {
            id: 'pdf-polaridades',
            title: 'As polaridades do feminino na contemporaneidade e a depressão pós-parto uma visão gestáltica',
            type: 'library',
            category: 'Artigo Científico',
            excerpt: 'Este artigo explora as nuances da fronteira de contato e a importância da awareness no processo de cura através de uma visão gestáltica.',
            pdfUrl: '/documents/As polaridades do feminino na contemporaneidade e a depressão pós-parto uma visão gestáltica.pdf',
            date: '2025'
        };

        try {
            const [coursesData, postsData] = await Promise.all([
                courseService.getAll(),
                blogService.getAll()
            ]);

            setCourses(coursesData);
            setBlogPosts([pdfItem, ...postsData]);
            setError(null);
        } catch (err) {
            console.error("Fetch error:", err);
            setError("Falha ao carregar dados remotos. Mostrando conteúdo local disponível.");
            // Ensure local items are still shown even if remote fetch fails
            setBlogPosts([pdfItem]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        localStorage.setItem('alertMessage', alertMessage);
    }, [alertMessage]);

    useEffect(() => {
        configService.save(googleConfig);
    }, [googleConfig]);

    const addCourse = async (course) => {
        try {
            const newCourse = await courseService.create(course);
            setCourses(prev => [...prev, newCourse]);
            return true;
        } catch (err) {
            console.error("Failed to add course", err);
            return false;
        }
    };

    const updateCourse = async (id, updatedData) => {
        try {
            await courseService.update(id, updatedData);
            setCourses(prev => prev.map(c => c.id === id ? { ...c, ...updatedData } : c));
        } catch (err) {
            console.error("Failed to update course", err);
        }
    };

    const deleteCourse = async (id) => {
        try {
            await courseService.delete(id);
            setCourses(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            console.error("Failed to delete course", err);
        }
    };

    const login = async (user, pass) => {
        try {
            await authService.login(user, pass);
            setIsAuthenticated(true);
            return true;
        } catch (error) {
            return false;
        }
    };

    const logout = () => {
        authService.logout();
        setIsAuthenticated(false);
    };

    return (
        <AppContext.Provider value={{
            courses,
            blogPosts,
            googleConfig,
            setGoogleConfig,
            alertMessage,
            setAlertMessage,
            loading,
            error,
            addCourse,
            updateCourse,
            deleteCourse,
            isAuthenticated,
            login,
            logout,
            refreshData: fetchData
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    return useContext(AppContext);
}
