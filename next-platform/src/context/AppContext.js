"use client";

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { courseService } from '../services/courseServiceSupabase';
import { blogService } from '../services/blogServiceSupabase';
import { contentService } from '../services/contentServiceSupabase';
import { configService } from '../services/configService';
import { authService } from '../services/authServiceSupabase';
import { galleryService } from '../services/galleryServiceSupabase';

const AppContext = createContext(null);

export function AppProvider({ children }) {
    const [courses, setCourses] = useState([]);
    const [blogPosts, setBlogPosts] = useState([]);
    const [gallery, setGallery] = useState([]);
    const [founderData, setFounderData] = useState(null);
    const [instituteData, setInstituteData] = useState(null);
    const [teamMembers, setTeamMembers] = useState([]);
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
            const [coursesData, postsData, galleryData, founderRes, instituteRes, teamRes] = await Promise.all([
                courseService.getAll(),
                blogService.getAll(),
                galleryService.getAll(),
                contentService.getContent('founder'),
                contentService.getContent('institute'),
                contentService.getTeamMembers()
            ]);
            setCourses(coursesData);
            setBlogPosts(postsData);
            setGallery(galleryData);
            setFounderData(founderRes);
            setInstituteData(instituteRes);
            setTeamMembers(teamRes);
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
            return true;
        } catch (err) {
            console.error("Failed to update course", err);
            return false;
        }
    };

    const deleteCourse = async (id) => {
        try {
            await courseService.delete(id);
            setCourses(prev => prev.filter(c => c.id !== id));
            return true;
        } catch (err) {
            console.error("Failed to delete course", err);
            return false;
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

    // Content Update Helpers
    const updateFounder = async (data) => {
        try {
            const updated = await contentService.updateContent('founder', data);
            setFounderData(updated);
            return true;
        } catch (err) {
            console.error("Failed to update founder", err);
            return false;
        }
    };

    const updateInstitute = async (data) => {
        try {
            const updated = await contentService.updateContent('institute', data);
            setInstituteData(updated);
            return true;
        } catch (err) {
            console.error("Failed to update institute", err);
            return false;
        }
    };

    // Team Helpers
    const addTeamMember = async (member) => {
        try {
            const newMember = await contentService.addTeamMember(member);
            setTeamMembers(prev => [...prev, newMember]);
            return true;
        } catch (err) {
            console.error(err); return false;
        }
    };

    const updateTeamMember = async (id, updates) => {
        try {
            const updated = await contentService.updateTeamMember(id, updates);
            setTeamMembers(prev => prev.map(m => m.id === id ? updated : m));
            return true;
        } catch (err) {
            console.error(err); return false;
        }
    };

    const deleteTeamMember = async (id) => {
        try {
            await contentService.deleteTeamMember(id);
            setTeamMembers(prev => prev.filter(m => m.id !== id));
            return true;
        } catch (err) {
            console.error(err); return false;
        }
    };


    return (
        <AppContext.Provider value={{
            courses,
            blogPosts,
            gallery,
            founderData,
            instituteData,
            teamMembers,
            loading,
            error,
            alertMessage,
            setAlertMessage,
            addCourse,
            updateCourse,
            deleteCourse,
            addBlogPost: async (post) => {
                try {
                    const newPost = await blogService.create(post);
                    setBlogPosts(prev => [newPost, ...prev]);
                    return true;
                } catch (err) {
                    console.error("Failed to add post", err);
                    return false;
                }
            },
            updateBlogPost: async (id, post) => {
                try {
                    await blogService.update(id, post);
                    setBlogPosts(prev => prev.map(p => p.id === id ? { ...p, ...post } : p));
                    return true;
                } catch (err) {
                    console.error("Failed to update post", err);
                    return false;
                }
            },
            deleteBlogPost: async (id) => {
                try {
                    await blogService.delete(id);
                    setBlogPosts(prev => prev.filter(p => p.id !== id));
                    return true;
                } catch (err) {
                    console.error("Failed to delete post", err);
                    return false;
                }
            },
            updateFounder,
            updateInstitute,
            addTeamMember,
            updateTeamMember,
            deleteTeamMember,
            fetchGallery: async () => {
                const data = await galleryService.getAll();
                setGallery(data);
            },
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
