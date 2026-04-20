import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DonorPage from './pages/DonorPage';
import NgoPage from './pages/NgoPage';
import MapExplorer from './pages/MapExplorer';
import EventHub from './pages/EventHub';
import NotFound from './pages/NotFound';

// Import all styles
import './styles/index.css';
import './styles/landing.css';
import './styles/auth.css';
import './styles/donor.css';
import './styles/ngo.css';
import './styles/components.css';

// Protected route component
function ProtectedRoute({ children, allowedRole }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-cream)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', animation: 'pulse-soft 1.5s ease-in-out infinite' }}>🌾</div>
          <p style={{ marginTop: 'var(--space-4)', color: 'var(--color-bark-light)', fontFamily: 'var(--font-accent)', fontSize: 'var(--text-xl)' }}>
            Loading Annvaya...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'ngo' ? '/ngo' : '/donor'} replace />;
  }

  return children;
}

// Layout wrapper that shows navbar/footer on public pages only
function AppLayout() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/donor') || location.pathname.startsWith('/ngo');
  const isAuth = location.pathname === '/login' || location.pathname === '/register';
  const isMap = location.pathname === '/map';
  const isEvent = location.pathname === '/events';

  const isHome = location.pathname === '/';

  // Map and Event pages render their own Navbar
  const showNavbar = !isDashboard && !isAuth && !isMap && !isEvent;
  const showFooter = !isDashboard && !isAuth && !isMap && !isEvent;

  return (
    <>
      {showNavbar && <Navbar />}
      <main className={(isDashboard || isMap || isAuth || isHome) ? 'main-full-width' : 'main-container'}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/map" element={<MapExplorer />} />
          <Route path="/events" element={<EventHub />} />
          <Route
            path="/donor/*"
            element={
              <ProtectedRoute allowedRole="donor">
                <DonorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ngo/*"
            element={
              <ProtectedRoute allowedRole="ngo">
                <NgoPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {showFooter && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </Router>
  );
}
