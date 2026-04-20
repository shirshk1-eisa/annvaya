import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import {
  FiHome, FiPlusCircle, FiList, FiCalendar, FiMap,
  FiUser, FiLogOut, FiMenu, FiX, FiClipboard
} from 'react-icons/fi';
import { getFoodEmoji, getTimeAgo, getStatusLabel } from '../../utils/mockData';
import { donationsAPI } from '../../utils/api';
import { getSocket } from '../../utils/socket';
import logoImg from '../../assets/images/logo.png';
import QuickDonateForm from './QuickDonateForm';
import MyDonations from './MyDonations';
import EventDonation from './EventDonation';
import FoodRequests from './FoodRequests';
import Profile from '../shared/Profile';

export default function DonorDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [userDonations, setUserDonations] = useState([]);

  useEffect(() => {
    donationsAPI.getMy().then(data => {
      setUserDonations(data.donations || []);
    }).catch(err => console.error('Failed to load donations:', err));

    const socket = getSocket();
    const handleStatusChange = (donation) => {
      setUserDonations(prev => prev.map(d => d._id === donation._id ? donation : d));
    };
    socket?.on('donation-status-changed', handleStatusChange);
    socket?.on('donation-accepted', handleStatusChange);

    return () => {
      socket?.off('donation-status-changed', handleStatusChange);
      socket?.off('donation-accepted', handleStatusChange);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const stats = user?.donorStats || { totalDonations: 0, mealsShared: 0, currentStreak: 0 };

  const sidebarLinks = [
    { id: 'overview', label: 'Overview', icon: <FiHome /> },
    { id: 'donate', label: 'Donate Food', icon: <FiPlusCircle /> },
    { id: 'my-donations', label: 'My Donations', icon: <FiList /> },
    { id: 'food-requests', label: 'NGO Requests', icon: <FiClipboard /> },
    { id: 'events', label: 'Event Donation', icon: <FiCalendar /> },
    { id: 'map', label: 'Explore Map', icon: <FiMap />, link: '/map' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'donate':
        return <QuickDonateForm />;
      case 'my-donations':
        return <MyDonations />;
      case 'food-requests':
        return <FoodRequests />;
      case 'events':
        return <EventDonation />;
      case 'profile':
        return <Profile />;
      default:
        return renderOverview();
    }
  };

  const renderOverview = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="dashboard-header">
        <div>
          <p className="dashboard-welcome">Namaste, {user?.name?.split(' ')[0] || 'Friend'} 🙏</p>
          <h1 className="dashboard-title">Your Dashboard</h1>
          <p className="dashboard-subtitle">Track your donations and make a difference today</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setActiveTab('donate')}
          id="quick-donate-btn"
        >
          <FiPlusCircle /> Donate Food
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card card">
          <div className="stat-icon earth">🍽️</div>
          <div className="stat-info">
            <h4>{stats.totalDonations}</h4>
            <p>Total Donations</p>
            <span className="stat-trend up">↑ 3 this week</span>
          </div>
        </div>
        <div className="stat-card card">
          <div className="stat-icon olive">🤲</div>
          <div className="stat-info">
            <h4>{stats.mealsShared}</h4>
            <p>Meals Shared</p>
            <span className="stat-trend up">↑ 45 this month</span>
          </div>
        </div>
        <div className="stat-card card">
          <div className="stat-icon ochre">🔥</div>
          <div className="stat-info">
            <h4>{stats.currentStreak} days</h4>
            <p>Current Streak</p>
            <span className="stat-trend up">Keep it going!</span>
          </div>
        </div>

      </div>

      {/* Recent Activity */}
      <div style={{ marginTop: 'var(--space-8)' }}>
        <h3 style={{ marginBottom: 'var(--space-4)' }}>Recent Donations</h3>
        <div className="donation-list">
          {userDonations.slice(0, 3).map((donation) => (
            <div key={donation._id || donation.id} className="donation-item card card-flat">
              <div className="donation-item-icon">
                {getFoodEmoji(donation.foodType)}
              </div>
              <div className="donation-item-info">
                <h4>{donation.title}</h4>
                <div className="donation-item-meta">
                  <span>{donation.quantity}</span>
                  <span>•</span>
                  <span>{getTimeAgo(donation.createdAt)}</span>
                </div>
              </div>
              <span className={`donation-item-status status-${donation.status.replace('_', '-')}`}>
                <span className={`status-dot ${donation.status.split('_')[0]}`}></span>
                {getStatusLabel(donation.status)}
              </span>
            </div>
          ))}
        </div>
        {userDonations.length > 3 && (
          <button
            className="btn btn-ghost"
            onClick={() => setActiveTab('my-donations')}
            style={{ marginTop: 'var(--space-4)' }}
          >
            View All Donations →
          </button>
        )}
      </div>


    </motion.div>
  );

  return (
    <div className="dashboard">
      {/* Sidebar Overlay (mobile) */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <Link to="/" className="sidebar-logo">
          <img src={logoImg} alt="" className="sidebar-logo-img" />
          Annvaya
        </Link>

        <nav className="sidebar-nav">
          <span className="sidebar-section-title">Menu</span>
          {sidebarLinks.map((link) => (
            <button
              key={link.id}
              className={`sidebar-link ${activeTab === link.id ? 'active' : ''}`}
              onClick={() => {
                if (link.link) {
                  navigate(link.link);
                } else {
                  setActiveTab(link.id);
                  setSidebarOpen(false);
                }
              }}
              id={`sidebar-${link.id}`}
            >
              <span className="sidebar-link-icon">{link.icon}</span>
              {link.label}
            </button>
          ))}

          <span className="sidebar-section-title" style={{ marginTop: 'var(--space-4)' }}>Account</span>
          <button className={`sidebar-link ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => { setActiveTab('profile'); setSidebarOpen(false); }} id="sidebar-profile">
            <span className="sidebar-link-icon"><FiUser /></span>
            Profile
          </button>
          <button className="sidebar-link" onClick={handleLogout} id="sidebar-logout">
            <span className="sidebar-link-icon"><FiLogOut /></span>
            Logout
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user?.name?.[0] || 'U'}
            </div>
            <div>
              <div className="sidebar-username">{user?.name || 'User'}</div>
              <div className="sidebar-userrole">Donor</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {renderContent()}
      </main>

      {/* Mobile menu button */}
      <button
        className="mobile-menu-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <FiX /> : <FiMenu />}
      </button>
    </div>
  );
}
