import { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_COURSES, INITIAL_BLOG_POSTS } from '../data';

const AppContext = createContext();

export function AppProvider({ children }) {
    const [courses, setCourses] = useState(() => {
        const saved = localStorage.getItem('courses');
        return saved ? JSON.parse(saved) : INITIAL_COURSES;
    });

    const [blogPosts, setBlogPosts] = useState(() => {
        const saved = localStorage.getItem('blogPosts');
        return saved ? JSON.parse(saved) : INITIAL_BLOG_POSTS;
    });

    const [alertMessage, setAlertMessage] = useState(() => {
        return localStorage.getItem('alertMessage') || "Bem-vindos ao Instituto Figura Viva";
    });

    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Persistence
    useEffect(() => {
        localStorage.setItem('courses', JSON.stringify(courses));
    }, [courses]);

    useEffect(() => {
        localStorage.setItem('blogPosts', JSON.stringify(blogPosts));
    }, [blogPosts]);

    useEffect(() => {
        localStorage.setItem('alertMessage', alertMessage);
    }, [alertMessage]);

    const addCourse = (course) => {
        setCourses([...courses, { ...course, id: Date.now() }]);
    };

    const updateCourse = (id, updatedData) => {
        setCourses(courses.map(c => c.id === id ? { ...c, ...updatedData } : c));
    };

    const deleteCourse = (id) => {
        setCourses(courses.filter(c => c.id !== id));
    };

    const login = (user, pass) => {
        if (user === 'admin' && pass === 'admin') {
            setIsAuthenticated(true);
            return true;
        }
        return false;
    };

    const logout = () => setIsAuthenticated(false);

    return (
        <AppContext.Provider value={{
            courses,
            blogPosts,
            alertMessage,
            setAlertMessage,
            addCourse,
            updateCourse,
            deleteCourse,
            isAuthenticated,
            login,
            logout
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    return useContext(AppContext);
}
