import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import logoImg from '../../assets/images/logo.png';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Don't show navbar on dashboard pages
  const isDashboard = location.pathname.startsWith('/donor') || location.pathname.startsWith('/ngo');
  if (isDashboard) return null;

  const isHome = location.pathname === '/';

  return (
    <motion.nav
      className={`navbar ${scrolled ? 'scrolled' : ''} ${isHome && !scrolled ? 'navbar-transparent' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" id="navbar-logo">
          <img src={logoImg} alt="Annvaya" className="navbar-logo-img" />
          <span className="navbar-logo-text">
            <span className="navbar-logo-name">Annvaya</span>
            <span className="navbar-logo-tagline">nourish · connect · sustain</span>
          </span>
        </Link>

        <ul className={`navbar-links ${mobileOpen ? 'open' : ''}`} id="navbar-links">
          {isAuthenticated && <li><Link to="/" className="navbar-link">Home</Link></li>}
          {isAuthenticated && !['/login', '/register'].includes(location.pathname) && (
            <>
              <li><Link to="/map" className="navbar-link">Explore Map</Link></li>
              <li><Link to="/events" className="navbar-link">Events</Link></li>
              <li><Link to="/about" className="navbar-link">About</Link></li>
            </>
          )}
          {mobileOpen && (
            <>
              {isAuthenticated ? (
                <>
                  <li>
                    <Link
                      to={user.role === 'ngo' ? '/ngo' : '/donor'}
                      className="btn btn-primary"
                    >
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <button onClick={handleLogout} className="btn btn-ghost">
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li><Link to="/login" className="btn btn-ghost">Sign In</Link></li>
                  <li><Link to="/register" className="btn btn-primary">Get Started</Link></li>
                </>
              )}
            </>
          )}
        </ul>

        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              <Link
                to={user.role === 'ngo' ? '/ngo' : '/donor'}
                className="btn btn-primary btn-sm"
                id="dashboard-btn"
              >
                Dashboard
              </Link>
              <button onClick={handleLogout} className="btn btn-ghost btn-sm" id="logout-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm" id="login-btn">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm" id="register-btn">
                Get Started
              </Link>
            </>
          )}
        </div>

        <button
          className={`navbar-mobile-btn ${mobileOpen ? 'open' : ''}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          id="mobile-menu-btn"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </motion.nav>
  );
}
