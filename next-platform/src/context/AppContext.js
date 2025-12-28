"use client";

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { courseService } from '../services/courseService';
import { blogService } from '../services/blogService';
import { configService } from '../services/configService';
import { authService } from '../services/authService';

const AppContext = createContext(null);

export function AppProvider({ children }) {
    const [courses, setCourses] = useState([]);
    const [blogPosts, setBlogPosts] = useState([]);
    const [googleConfig, setGoogleConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [alertMessage, setAlertMessage] = useState("Bem-vindos ao Instituto Figura Viva");
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    // Auth State Listener
    useEffect(() => {
        const unsubscribe = authService.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        // Hydrate from localStorage on mount
        const savedAlert = localStorage.getItem('alertMessage');
        if (savedAlert) setAlertMessage(savedAlert);

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

    const login = async (email, password) => {
        try {
            await authService.login(email, password);
            return true;
        } catch (error) {
            console.error("Login failed", error);
            return false;
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <AppContext.Provider value={{
            courses,
            blogPosts,
            loading,
            error,
            alertMessage,
            setAlertMessage,
            addCourse,
            updateCourse,
            deleteCourse,
            login,
            logout,
            isAuthenticated: !!user,
            user,
            authLoading,
            googleConfig,
            setGoogleConfig
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}
