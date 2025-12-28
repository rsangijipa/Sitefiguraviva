import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import PublicHome from './pages/PublicHome';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import StudentPortal from './pages/StudentPortal';
import CourseDetail from './pages/CourseDetail';
import BlogDetail from './pages/BlogDetail';
import ScrollToTopButton from './components/ScrollToTopButton';

// --- Protected Route Wrapper ---
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useApp();
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return children;
}

// --- Scroll to Top on Route Change ---
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppContent() {
  return (
    <>
      <ScrollToTop />
      <ScrollToTopButton />
      <Routes>
        <Route path="/" element={<PublicHome />} />
        <Route path="/portal" element={<StudentPortal />} />
        <Route path="/curso/:id" element={<CourseDetail />} />
        <Route path="/blog/:id" element={<BlogDetail />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/*" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
}
