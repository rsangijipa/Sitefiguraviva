import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCourses, getGalleryItems, getMediators } from '../services/dataService'; // NEW Firebase Service
import { blogService } from '../services/blogService';
import { configService } from '../services/configService';
import { authService } from '../services/authService';

const AppContext = createContext();

export function AppProvider({ children }) {
    const [courses, setCourses] = useState([]);
    const [gallery, setGallery] = useState([]); // NEW
    const [mediators, setMediators] = useState([]); // NEW
    const [blogPosts, setBlogPosts] = useState([]);
    const [googleConfig, setGoogleConfig] = useState(configService.get());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState({ message: '', type: 'success', isVisible: false });

    const [alertMessage, setAlertMessage] = useState(() => {
        return localStorage.getItem('alertMessage') || "Bem-vindos ao Instituto Figura Viva";
    });

    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return authService.isAuthenticated();
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        // Hardcoded PDF item (keep local for now as it's not in courses DB yet perhaps, or move to DB later)
        const pdfItem = {
            id: 'pdf-polaridades',
            title: 'As polaridades do feminino na contemporaneidade e a depressão pós-parto uma visão gestáltica',
            type: 'library',
            category: 'Artigo Científico',
            excerpt: 'Este artigo explora as nuances da fronteira de contato e a importância da awareness no processo de cura através de uma visão gestáltica.',
            pdfUrl: '/documents/As polaridades do feminino na contemporaneidade e a depressão pós-parto uma visão gestáltica.pdf',
            date: '2025'
        };

        // FAIL-SAFE DATA FETCHING
        // We fetch each resource independently so one failure doesn't block the others.

        // 1. Courses
        try {
            const coursesData = await getCourses();
            if (coursesData && coursesData.length > 0) {
                setCourses(coursesData);
            } else {
                console.warn("⚠️ No courses found (or empty list returned).");
            }
        } catch (e) {
            console.error("❌ Failed to load courses:", e);
        }

        // 2. Gallery
        try {
            const galleryData = await getGalleryItems();
            setGallery(galleryData || []);
        } catch (e) {
            console.error("❌ Failed to load gallery:", e);
        }

        // 3. Mediators
        try {
            const mediatorsData = await getMediators();
            setMediators(mediatorsData || []);
        } catch (e) {
            console.error("❌ Failed to load mediators:", e);
        }

        // 4. Blog Posts
        try {
            const postsData = await blogService.getAll();
            setBlogPosts(postsData && postsData.length > 0 ? [pdfItem, ...postsData] : [pdfItem]);
        } catch (e) {
            console.error("❌ Failed to load blog:", e);
            setBlogPosts([pdfItem]); // Fallback to essential content
        }

        setLoading(false);
        setError(null);
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

    // Admin Actions - placeholders for now until we fully wire admin to new service
    const addCourse = async (course) => {
        console.warn("Add Course not fully migrated to new service yet in context wrapper");
        // Implementation pending full Admin migration
        return false;
    };

    const updateCourse = async (id, updatedData) => {
        console.warn("Update Course not fully migrated");
    };

    const deleteCourse = async (id) => {
        console.warn("Delete Course not fully migrated");
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

    const showToast = (message, type = 'success') => {
        setToast({ message, type, isVisible: true });
    };

    const hideToast = () => {
        setToast(prev => ({ ...prev, isVisible: false }));
    };

    return (
        <AppContext.Provider value={{
            courses,
            gallery, // Expose
            mediators, // Expose
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
            refreshData: fetchData,
            toast,
            showToast,
            hideToast
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    return useContext(AppContext);
}
