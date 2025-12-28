"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { courseService } from '../services/courseService';
import { blogService } from '../services/blogService';
import { configService } from '../services/configService';

const AppContext = createContext(null);

export function AppProvider({ children }) {
    const [courses, setCourses] = useState([]);
    const [blogPosts, setBlogPosts] = useState([]);
    const [googleConfig, setGoogleConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [alertMessage, setAlertMessage] = useState("Bem-vindos ao Instituto Figura Viva");
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Hydrate from localStorage on mount
        const savedAlert = localStorage.getItem('alertMessage');
        const savedAuth = localStorage.getItem('isAdmin');

        if (savedAlert) setAlertMessage(savedAlert);
        if (savedAuth === 'true') setIsAuthenticated(true);

        setGoogleConfig(configService.get());
    }, []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [coursesData, postsData] = await Promise.all([
                courseService.getAll(),
                blogService.getAll()
            ]);
            setCourses(coursesData);
            setBlogPosts(postsData);
            setError(null);
        } catch (err) {
            console.error("Fetch error:", err);
            setError("Falha ao carregar dados. Usando dados locais.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('alertMessage', alertMessage);
        }
    }, [alertMessage]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('isAdmin', isAuthenticated);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (googleConfig) {
            configService.save(googleConfig);
        }
    }, [googleConfig]);

    const addCourse = async (course) => {
        try {
            const newCourse = await courseService.create(course);
            setCourses(prev => [...prev, newCourse]);
            return true;
        } catch (err) {
            setCourses(prev => [...prev, { ...course, id: Date.now() }]);
            return true;
        }
    };

    const updateCourse = async (id, updatedData) => {
        try {
            await courseService.update(id, updatedData);
            setCourses(prev => prev.map(c => c.id === id ? { ...c, ...updatedData } : c));
        } catch (err) {
            setCourses(prev => prev.map(c => c.id === id ? { ...c, ...updatedData } : c));
        }
    };

    const deleteCourse = async (id) => {
        try {
            await courseService.delete(id);
            setCourses(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            setCourses(prev => prev.filter(c => c.id !== id));
        }
    };

    const login = (user, pass) => {
        if (user === 'admin' && pass === 'admin') {
            setIsAuthenticated(true);
            return true;
        }
        return false;
    };

    const logout = () => {
        setIsAuthenticated(false);
        if (typeof window !== 'undefined') {
            localStorage.removeItem('isAdmin');
        }
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
