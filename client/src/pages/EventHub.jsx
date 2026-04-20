import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiMapPin, FiUsers, FiBell, FiPlus, FiX, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { getEventEmoji } from '../utils/mockData';
import { eventsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

export default function EventHub() {
  const [filter, setFilter] = useState('all');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribeModal, setSubscribeModal] = useState(null);
  const [needQty, setNeedQty] = useState('');
  const { user, isAuthenticated } = useAuth();

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const data = await eventsAPI.getAll();
        setEvents(data.events || []);
      } catch (err) {
        console.error('Failed to load events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filtered = filter === 'all'
    ? events
    : events.filter(e => e.eventType === filter);

  const getCapacityInfo = (event) => {
    const totalClaimed = (event.claims || []).reduce((sum, c) => sum + c.quantityClaimed, 0);
    const remaining = (event.surplusQuantity || 0) - totalClaimed;
    const isFull = remaining <= 0;
    const percentClaimed = event.surplusQuantity ? Math.min((totalClaimed / event.surplusQuantity) * 100, 100) : 0;
    return { totalClaimed, remaining: Math.max(0, remaining), isFull, percentClaimed };
  };

  const isUserSubscribed = (event) => {
    if (!user || user.role !== 'ngo') return false;
    return (event.claims || []).some(c => c.ngoId === user._id || c.ngoId === user.id);
  };

  const handleSubscribe = async (eventId) => {
    const qty = parseInt(needQty);
    if (!qty || qty <= 0) return;
    try {
      const data = await eventsAPI.claim(eventId, qty);
      setEvents(prev => prev.map(ev => ev._id === eventId ? data.event : ev));
    } catch (err) {
      console.error('Failed to subscribe:', err);
      alert('Failed to subscribe: ' + err.message);
    }
    setSubscribeModal(null);
    setNeedQty('');
  };

  const handleCancelSubscription = async (eventId) => {
    try {
      const data = await eventsAPI.unsubscribe(eventId);
      setEvents(prev => prev.map(ev => ev._id === eventId ? data.event : ev));
    } catch (err) {
      console.error('Failed to cancel subscription:', err);
    }
  };

  const eventTypeColors = {
    wedding: { bg: 'rgba(193, 105, 79, 0.1)', color: 'var(--color-earth)' },
    corporate: { bg: 'rgba(91, 139, 160, 0.1)', color: 'var(--color-info)' },
    festival: { bg: 'rgba(212, 149, 43, 0.1)', color: 'var(--color-ochre)' },
    community: { bg: 'rgba(107, 127, 59, 0.1)', color: 'var(--color-olive)' },
    other: { bg: 'rgba(156, 175, 136, 0.1)', color: 'var(--color-sage)' },
  };

  return (
    <>
      <Navbar />
      <div className="event-hub" id="event-hub">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ marginBottom: 'var(--space-8)', paddingTop: 'var(--space-8)' }}
          >
            <span className="section-eyebrow">Inform & Schedule Ahead</span>
            <h1 className="section-title">🎉 Event Hub</h1>
            <p className="section-desc">
              Hosting a wedding, corporate lunch, or festival? Inform us about your upcoming event
              so NGOs can schedule pickups in advance. Less waste, more impact.
            </p>
          </motion.div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
            <div className="tabs">
              {[
                { id: 'all', label: 'All Events' },
                { id: 'wedding', label: '💒 Weddings' },
                { id: 'corporate', label: '🏢 Corporate' },
                { id: 'festival', label: '🪔 Festivals' },
                { id: 'community', label: '🌿 Community' },
              ].map((f) => (
                <button
                  key={f.id}
                  className={`tab ${filter === f.id ? 'active' : ''}`}
                  onClick={() => setFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <a href="/donor" className="btn btn-primary">
              <FiPlus /> Register Your Event
            </a>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-16)', color: 'var(--color-bark-light)' }}>
              <p>Loading events...</p>
            </div>
          ) : (
            <div className="events-grid" style={{ marginBottom: 'var(--space-16)' }}>
              {filtered.map((event, index) => {
                const typeColor = eventTypeColors[event.eventType] || eventTypeColors.other;
                const eventDate = new Date(event.date);
                const capacity = getCapacityInfo(event);
                const userSubscribed = isUserSubscribed(event);
                const isNgo = isAuthenticated && user?.role === 'ngo';

                return (
                  <motion.div
                    key={event._id}
                    className="event-card card"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    style={{ padding: 0, overflow: 'hidden' }}
                  >
                    <div className="event-card-image" style={{
                      background: `linear-gradient(135deg, ${typeColor.bg}, var(--color-sand-light))`,
                      position: 'relative'
                    }}>
                      <motion.span
                        style={{ fontSize: '3.5rem' }}
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        {getEventEmoji(event.eventType)}
                      </motion.span>
                      {capacity.isFull && (
                        <div className="event-full-badge">
                          <FiCheckCircle size={12} /> Fully Claimed
                        </div>
                      )}
                    </div>

                    <div className="event-card-body">
                      <span
                        className="event-card-type badge"
                        style={{ background: typeColor.bg, color: typeColor.color }}
                      >
                        {event.eventType}
                      </span>

                      <h3 className="event-card-title">{event.eventName}</h3>

                      <div className="event-card-meta">
                        <div className="event-card-meta-item">
                          <FiCalendar size={14} />
                          <span>
                            {eventDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                            {' at '}
                            {eventDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="event-card-meta-item">
                          <FiMapPin size={14} />
                          <span>{event.location?.address || 'TBD'}</span>
                        </div>
                      </div>

                      <div className="event-capacity-section">
                        <div className="event-capacity-header">
                          <span className="event-capacity-label">
                            📦 {event.surplusQuantity || 0} {event.surplusUnit || 'meals'} available
                          </span>
                          <span className={`event-capacity-status ${capacity.isFull ? 'full' : 'open'}`}>
                            {capacity.isFull ? 'Fully Claimed' : `${capacity.remaining} ${event.surplusUnit || 'meals'} left`}
                          </span>
                        </div>
                        <div className="event-capacity-bar">
                          <div
                            className={`event-capacity-fill ${capacity.isFull ? 'full' : ''}`}
                            style={{ width: `${capacity.percentClaimed}%` }}
                          />
                        </div>
                        {event.claims && event.claims.length > 0 && (
                          <div className="event-claims-list">
                            {event.claims.map((claim, i) => (
                              <span key={i} className="event-claim-chip">
                                {claim.ngoName}: {claim.quantityClaimed} {event.surplusUnit || 'meals'}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)', marginBottom: 'var(--space-4)' }}>
                        {(event.foodTypes || []).map((food, i) => (
                          <span key={i} className="donation-card-tag" style={{ fontSize: 'var(--text-xs)' }}>
                            {food}
                          </span>
                        ))}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="event-subscribers">
                          <FiUsers size={14} />
                          {event.claims?.length || 0} NGOs subscribed
                        </div>

                        {isNgo ? (
                          userSubscribed ? (
                            <button
                              className="btn btn-sm btn-ghost"
                              onClick={() => handleCancelSubscription(event._id)}
                              style={{ color: 'var(--color-wine)', borderColor: 'var(--color-wine)' }}
                            >
                              <FiX size={14} /> Cancel
                            </button>
                          ) : capacity.isFull ? (
                            <span className="event-closed-label">
                              <FiAlertCircle size={14} /> Subscription Closed
                            </span>
                          ) : (
                            <button
                              className="btn btn-sm btn-olive"
                              onClick={() => { setSubscribeModal(event._id); setNeedQty(''); }}
                            >
                              <FiBell size={14} /> Subscribe
                            </button>
                          )
                        ) : (
                          <span className="event-subscribers" style={{ fontSize: 'var(--text-xs)', opacity: 0.6 }}>
                            Login as NGO to subscribe
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: 'var(--space-16)', color: 'var(--color-bark-light)' }}>
              <p style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>📅</p>
              <h3>No events yet</h3>
              <p>Register your first event or check back soon!</p>
            </div>
          )}

          <div className="section" style={{ paddingBottom: 'var(--space-8)' }}>
            <div className="card" style={{
              padding: 'var(--space-8)',
              background: 'linear-gradient(135deg, rgba(107, 127, 59, 0.06), rgba(212, 149, 43, 0.06))',
              border: '1px solid rgba(107, 127, 59, 0.15)',
              textAlign: 'center'
            }}>
              <h3 style={{ marginBottom: 'var(--space-3)' }}>📋 How It Works</h3>
              <p style={{ color: 'var(--color-bark-light)', maxWidth: '700px', margin: '0 auto', lineHeight: 1.7 }}>
                <strong>1.</strong> Event organizers pre-register their event and expected surplus food.
                <strong> 2.</strong> NGOs specify how much they need and subscribe — capacity is tracked in real-time.
                <strong> 3.</strong> Once the surplus is fully claimed, subscriptions close automatically.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* Subscribe Modal */}
      <AnimatePresence>
        {subscribeModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSubscribeModal(null)}
          >
            <motion.div
              className="modal-content card"
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '440px', padding: 'var(--space-8)' }}
            >
              {(() => {
                const event = events.find(e => e._id === subscribeModal);
                if (!event) return null;
                const capacity = getCapacityInfo(event);
                return (
                  <>
                    <h3 style={{ marginBottom: 'var(--space-2)' }}>
                      🔔 Subscribe to {event.eventName}
                    </h3>
                    <p style={{ color: 'var(--color-bark-light)', marginBottom: 'var(--space-6)', fontSize: 'var(--text-sm)' }}>
                      Available: <strong>{capacity.remaining} {event.surplusUnit || 'meals'}</strong> out of {event.surplusQuantity} {event.surplusUnit || 'meals'}
                    </p>

                    <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 600, fontSize: 'var(--text-sm)' }}>
                      How much does your NGO need? ({event.surplusUnit || 'meals'})
                    </label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder={`Max ${capacity.remaining} ${event.surplusUnit || 'meals'}`}
                      value={needQty}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        if (val <= capacity.remaining) setNeedQty(e.target.value);
                      }}
                      max={capacity.remaining}
                      min={1}
                      style={{ marginBottom: 'var(--space-6)', width: '100%' }}
                    />

                    <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setSubscribeModal(null)}>
                        Cancel
                      </button>
                      <button
                        className="btn btn-olive btn-sm"
                        onClick={() => handleSubscribe(subscribeModal)}
                        disabled={!needQty || parseInt(needQty) <= 0}
                      >
                        <FiCheckCircle /> Confirm Subscription
                      </button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
