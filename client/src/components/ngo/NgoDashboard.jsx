import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome, FiSearch, FiClipboard, FiTruck, FiBarChart2,
  FiUser, FiLogOut, FiMenu, FiX, FiMap, FiCalendar, FiBell,
  FiCheck, FiPhone, FiClock
} from 'react-icons/fi';
import { getFoodEmoji, getTimeAgo, getStatusLabel, getTimeUntil } from '../../utils/mockData';
import { donationsAPI, foodRequestsAPI, pickupsAPI } from '../../utils/api';
import { getSocket } from '../../utils/socket';
import logoImg from '../../assets/images/logo.png';
import AvailableDonations from './AvailableDonations';
import FoodRequestBoard from './FoodRequestBoard';
import PickupManager from './PickupManager';
import ImpactReports from './ImpactReports';
import DonationHistory from './DonationHistory';
import BrowseEvents from './BrowseEvents';
import Profile from '../shared/Profile';

export default function NgoDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [acceptedOverviewIds, setAcceptedOverviewIds] = useState([]);
  const [scheduledPickups, setScheduledPickups] = useState({});
  const [showScheduleModal, setShowScheduleModal] = useState(null);
  const [pickupForm, setPickupForm] = useState({ time: '', driver: '', contact: '', notes: '' });
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [allDonations, setAllDonations] = useState([]);
  const [foodRequests, setFoodRequests] = useState([]);
  const [pickups, setPickups] = useState([]);

  // Centralized data fetch functions
  const refreshDonations = () => donationsAPI.getAll().then(data => setAllDonations(data.donations || [])).catch(console.error);
  const refreshRequests = () => foodRequestsAPI.getAll().then(data => setFoodRequests(data.requests || [])).catch(console.error);
  const refreshPickups = () => pickupsAPI.getAll().then(data => setPickups(data.pickups || [])).catch(console.error);
  const refreshAll = () => { refreshDonations(); refreshRequests(); refreshPickups(); };

  useEffect(() => {
    // Initial fetch
    refreshAll();

    // Socket.io real-time listeners — auto-update without refresh
    const socket = getSocket();
    socket?.on('new-donation', (donation) => {
      setAllDonations(prev => [donation, ...prev]);
    });
    socket?.on('donation-accepted', (donation) => {
      setAllDonations(prev => prev.map(d => d._id === donation._id ? donation : d));
    });
    socket?.on('donation-status-changed', (donation) => {
      setAllDonations(prev => prev.map(d => d._id === donation._id ? donation : d));
    });
    socket?.on('new-food-request', (request) => {
      setFoodRequests(prev => [request, ...prev]);
    });
    socket?.on('request-fulfilled', (request) => {
      setFoodRequests(prev => prev.map(r => r._id === request._id ? request : r));
    });
    socket?.on('pickup-update', (pickup) => {
      if (pickup.status === 'cancelled') {
        setPickups(prev => prev.filter(p => p._id !== pickup._id));
      } else {
        setPickups(prev => {
          const exists = prev.find(p => p._id === pickup._id);
          if (exists) return prev.map(p => p._id === pickup._id ? pickup : p);
          return [pickup, ...prev];
        });
      }
    });

    return () => {
      socket?.off('new-donation');
      socket?.off('donation-accepted');
      socket?.off('donation-status-changed');
      socket?.off('new-food-request');
      socket?.off('request-fulfilled');
      socket?.off('pickup-update');
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleOverviewAccept = (donation) => {
    setPickupForm({ time: '', driver: '', contact: '', notes: '' });
    setShowScheduleModal(donation);
  };

  const handleSchedulePickup = async () => {
    if (!showScheduleModal) return;
    const donationId = showScheduleModal._id || showScheduleModal.id;
    try {
      // Accept the donation first
      await donationsAPI.accept(donationId);
      // Schedule pickup
      await pickupsAPI.create({
        donationId,
        scheduledTime: pickupForm.time || new Date().toISOString(),
        driver: pickupForm.driver || 'Unassigned',
        contact: pickupForm.contact || '',
        notes: pickupForm.notes || '',
      });
      setAcceptedOverviewIds(prev => [...prev, donationId]);
      setScheduledPickups(prev => ({
        ...prev,
        [donationId]: {
          time: pickupForm.time || 'ASAP',
          driver: pickupForm.driver || 'Unassigned',
          contact: pickupForm.contact || '',
          notes: pickupForm.notes,
        }
      }));
      // Refresh data
      donationsAPI.getAll().then(data => setAllDonations(data.donations || []));
      pickupsAPI.getAll().then(data => setPickups(data.pickups || []));
    } catch (err) {
      console.error('Failed to schedule pickup:', err);
    }
    setShowScheduleModal(null);
    setPickupForm({ time: '', driver: '', contact: '', notes: '' });
  };

  const handleCancelPickup = async (donationId) => {
    try {
      // Find the pickup for this donation and cancel it on the server
      const pickup = pickups.find(p => (p.donation?._id || p.donation) === donationId);
      if (pickup) {
        await pickupsAPI.cancel(pickup._id);
      }
      setAcceptedOverviewIds(prev => prev.filter(id => id !== donationId));
      setScheduledPickups(prev => {
        const updated = { ...prev };
        delete updated[donationId];
        return updated;
      });
      // Refresh data
      refreshAll();
    } catch (err) {
      console.error('Failed to cancel pickup:', err);
    }
  };

  const availableDonations = allDonations.filter(d => d.status === 'available');
  const activePickups = pickups.filter(p => p.status !== 'completed');

  const sidebarLinks = [
    { id: 'overview', label: 'Overview', icon: <FiHome /> },
    { id: 'browse', label: 'Browse Donations', icon: <FiSearch /> },
    { id: 'requests', label: 'Food Request Board', icon: <FiClipboard /> },
    { id: 'pickups', label: 'Pickup Manager', icon: <FiTruck /> },
    { id: 'history', label: 'Donation History', icon: <FiClock /> },
    { id: 'impact', label: 'Impact Reports', icon: <FiBarChart2 /> },
    { id: 'events', label: 'Browse Events', icon: <FiCalendar /> },
    { id: 'map', label: 'Explore Map', icon: <FiMap />, link: '/map' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'browse': return <AvailableDonations donations={allDonations} onRefresh={refreshAll} />;
      case 'requests': return <FoodRequestBoard requests={foodRequests} onRefresh={refreshRequests} />;
      case 'pickups': return <PickupManager pickups={pickups} onRefresh={refreshPickups} />;
      case 'history': return <DonationHistory />;
      case 'impact': return <ImpactReports />;
      case 'events': return <BrowseEvents />;
      case 'profile': return <Profile />;
      default: return renderOverview();
    }
  };

  const renderOverview = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="dashboard-header">
        <div>
          <p className="dashboard-welcome">Welcome back 🙏</p>
          <h1 className="dashboard-title">{user?.ngoDetails?.organizationName || 'NGO Dashboard'}</h1>
          <p className="dashboard-subtitle">
            {user?.ngoDetails?.verified && (
              <span className="badge badge-olive" style={{ marginRight: 'var(--space-2)' }}>✓ Verified</span>
            )}
            Manage donations, requests, and track your impact
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button className="btn btn-primary" onClick={() => setActiveTab('browse')}>
            <FiSearch /> Browse Donations
          </button>
          <button className="btn btn-secondary" onClick={() => setActiveTab('requests')}>
            <FiClipboard /> Post Request
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card card">
          <div className="stat-icon olive">📥</div>
          <div className="stat-info">
            <h4>{availableDonations.length}</h4>
            <p>Available Nearby</p>
            <span className="stat-trend up">New in last hour!</span>
          </div>
        </div>
        <div className="stat-card card">
          <div className="stat-icon ochre">🚚</div>
          <div className="stat-info">
            <h4>{activePickups.length}</h4>
            <p>Active Pickups</p>
          </div>
        </div>
        <div className="stat-card card">
          <div className="stat-icon earth">🍽️</div>
          <div className="stat-info">
            <h4>1,250</h4>
            <p>Meals Served (Month)</p>
            <span className="stat-trend up">↑ 18% vs last month</span>
          </div>
        </div>
        <div className="stat-card card">
          <div className="stat-icon info">📋</div>
          <div className="stat-info">
            <h4>{foodRequests.filter(r => r.status === 'open').length}</h4>
            <p>Open Requests</p>
          </div>
        </div>
      </div>

      {/* Incoming Donations */}
      <div style={{ marginTop: 'var(--space-8)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <h3>
            <FiBell style={{ verticalAlign: 'middle', marginRight: '8px', color: 'var(--color-ochre)' }} />
            Fresh Donations Nearby
          </h3>
          <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('browse')}>
            View All →
          </button>
        </div>
        <div className="donation-list">
          {availableDonations.slice(0, 3).map((donation) => {
            const did = donation._id || donation.id;
            const isAccepted = acceptedOverviewIds.includes(did);
            const pickupInfo = scheduledPickups[did];
            return (
              <div key={did} className="donation-item card" style={{ cursor: 'pointer' }}>
                <div className="donation-item-icon">{getFoodEmoji(donation.foodType)}</div>
                <div className="donation-item-info">
                  <h4>{donation.title}</h4>
                  <div className="donation-item-meta">
                    <span>{donation.quantity}</span>
                    <span>•</span>
                    <span>{donation.location?.address || ''}</span>
                    <span>•</span>
                    <span>{getTimeAgo(donation.createdAt)}</span>
                  </div>
                  {isAccepted && pickupInfo && (
                    <div style={{
                      marginTop: 'var(--space-2)',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-olive)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                      fontWeight: 500
                    }}>
                      <FiTruck size={12} />
                      Pickup: {pickupInfo.time} · Driver: {pickupInfo.driver}{pickupInfo.contact && ` · 📞 ${pickupInfo.contact}`}
                    </div>
                  )}
                </div>
                <span className="donation-item-status status-available">
                  <span className={`status-dot ${isAccepted ? 'accepted' : 'available'}`}></span>
                  {getTimeUntil(donation.bestBefore)}
                </span>
                <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                  {isAccepted ? (
                    <>
                      <span
                        className="badge badge-olive"
                        style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-1) var(--space-3)' }}
                      >
                        <FiCheck size={12} style={{ marginRight: '3px', verticalAlign: 'middle' }} />
                        Pickup Scheduled
                      </span>
                      <button
                        className="btn btn-sm"
                        onClick={(e) => { e.stopPropagation(); handleCancelPickup(did); }}
                        style={{
                          background: 'rgba(114, 47, 55, 0.08)',
                          color: 'var(--color-wine)',
                          border: '1px solid rgba(114, 47, 55, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: 'var(--space-1) var(--space-3)',
                          fontSize: 'var(--text-xs)'
                        }}
                      >
                        <FiX size={12} /> Cancel
                      </button>
                    </>
                  ) : (
                    <button className="btn btn-olive btn-sm" onClick={(e) => { e.stopPropagation(); handleOverviewAccept(donation); }}>
                      Accept
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Requests Summary */}
      <div style={{ marginTop: 'var(--space-8)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <h3>Your Active Requests</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('requests')}>
            Manage →
          </button>
        </div>
        <div className="grid-2">
          {foodRequests.slice(0, 2).map((req) => (
            <div key={req._id || req.id} className="card">
              <h4 style={{ marginBottom: 'var(--space-3)' }}>{req.title}</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                {req.itemsNeeded.map((item, i) => (
                  <span key={i} className={`badge badge-${item.urgency === 'critical' ? 'wine' : item.urgency === 'high' ? 'ochre' : 'olive'}`}>
                    {item.item} — {item.quantity}
                  </span>
                ))}
              </div>
              <div className="request-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(req.fulfilledBy.length / req.itemsNeeded.length) * 100}%` }}></div>
                </div>
                <span className="progress-text">
                  {req.fulfilledBy.length} of {req.itemsNeeded.length} items fulfilled
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="dashboard ngo-dashboard">
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <Link to="/" className="sidebar-logo">
          <img src={logoImg} alt="" className="sidebar-logo-img" />
          Annvaya
        </Link>

        <nav className="sidebar-nav">
          <span className="sidebar-section-title">NGO Portal</span>
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
              id={`ngo-sidebar-${link.id}`}
            >
              <span className="sidebar-link-icon">{link.icon}</span>
              {link.label}
            </button>
          ))}

          <span className="sidebar-section-title" style={{ marginTop: 'var(--space-4)' }}>Account</span>
          <button className={`sidebar-link ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => { setActiveTab('profile'); setSidebarOpen(false); }} id="ngo-sidebar-profile">
            <span className="sidebar-link-icon"><FiUser /></span>
            NGO Profile
          </button>
          <button className="sidebar-link" onClick={handleLogout} id="ngo-sidebar-logout">
            <span className="sidebar-link-icon"><FiLogOut /></span>
            Logout
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar" style={{ background: 'linear-gradient(135deg, var(--color-olive), var(--color-sage))' }}>
              {(user?.ngoDetails?.organizationName || 'N')[0]}
            </div>
            <div>
              <div className="sidebar-username">{user?.ngoDetails?.organizationName || 'NGO'}</div>
              <div className="sidebar-userrole">NGO Partner</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="dashboard-main">{renderContent()}</main>

      <button
        className="mobile-menu-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <FiX /> : <FiMenu />}
      </button>

      {/* Schedule Pickup Modal */}
      <AnimatePresence>
        {showScheduleModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowScheduleModal(null)}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '520px', padding: 'var(--space-8)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)' }}>
                <div>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                    <FiTruck /> Schedule Pickup
                  </h3>
                  <p style={{ color: 'var(--color-bark-light)', fontSize: 'var(--text-sm)' }}>
                    Set the pickup details for this donation
                  </p>
                </div>
                <button
                  onClick={() => setShowScheduleModal(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-bark-light)', fontSize: '1.3rem' }}
                >
                  <FiX />
                </button>
              </div>

              {/* Donation summary */}
              <div style={{
                background: 'var(--color-sand-light)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-4)',
                marginBottom: 'var(--space-6)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)'
              }}>
                <span style={{ fontSize: '2rem' }}>{getFoodEmoji(showScheduleModal.foodType)}</span>
                <div>
                  <h4 style={{ fontSize: 'var(--text-base)', marginBottom: '2px' }}>{showScheduleModal.title}</h4>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-bark-light)' }}>
                    {showScheduleModal.quantity} · {showScheduleModal.location.address}
                  </p>
                </div>
              </div>

              {/* Form fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <FiCalendar size={14} /> Pickup Time
                  </label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={pickupForm.time}
                    onChange={(e) => setPickupForm(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <FiTruck size={14} /> Driver / Volunteer Name
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Ravi Kumar"
                    value={pickupForm.driver}
                    onChange={(e) => setPickupForm(prev => ({ ...prev, driver: e.target.value }))}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <FiPhone size={14} /> Contact Number
                  </label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="e.g. +91 98765 43210"
                    value={pickupForm.contact}
                    onChange={(e) => setPickupForm(prev => ({ ...prev, contact: e.target.value }))}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">📝 Notes (optional)</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Any special instructions for pickup..."
                    rows={3}
                    value={pickupForm.notes}
                    onChange={(e) => setPickupForm(prev => ({ ...prev, notes: e.target.value }))}
                    style={{ minHeight: '70px' }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)', justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost" onClick={() => setShowScheduleModal(null)}>
                  Cancel
                </button>
                <button className="btn btn-olive" onClick={handleSchedulePickup}>
                  <FiCheck size={16} /> Confirm & Schedule
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
