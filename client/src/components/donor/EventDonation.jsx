import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiMapPin, FiUsers, FiCheck, FiEye, FiPlus } from 'react-icons/fi';
import { eventsAPI } from '../../utils/api';
import { getSocket } from '../../utils/socket';

const EVENT_TYPES = [
  { id: 'wedding', icon: '💒', label: 'Wedding / Reception' },
  { id: 'corporate', icon: '🏢', label: 'Corporate Event' },
  { id: 'festival', icon: '🪔', label: 'Festival / Religious' },
  { id: 'community', icon: '🌿', label: 'Community Gathering' },
  { id: 'other', icon: '🎉', label: 'Other' },
];

export default function EventDonation() {
  const [activeView, setActiveView] = useState('my-events');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [myEvents, setMyEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [formData, setFormData] = useState({
    eventName: '',
    eventType: '',
    date: '',
    estimatedSurplus: '',
    foodTypes: '',
    address: '',
    specialNotes: '',
  });

  const fetchMyEvents = async () => {
    try {
      setEventsLoading(true);
      const data = await eventsAPI.getMy();
      setMyEvents(data.events || []);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setEventsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyEvents();
  }, []);

  // Real-time event updates
  useEffect(() => {
    const socket = getSocket();
    const handleEventUpdated = (event) => {
      setMyEvents(prev => prev.map(e => e._id === event._id ? event : e));
    };
    socket?.on('event-updated', handleEventUpdated);
    return () => {
      socket?.off('event-updated', handleEventUpdated);
    };
  }, []);

  const handleSubmit = async () => {
    if (!formData.eventName || !formData.eventType || !formData.date) {
      setError('Please fill in event name, type, and date');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await eventsAPI.create({
        eventName: formData.eventName,
        eventType: formData.eventType,
        date: formData.date,
        estimatedSurplus: formData.estimatedSurplus,
        surplusQuantity: parseInt(formData.estimatedSurplus) || 0,
        foodTypes: formData.foodTypes ? formData.foodTypes.split(',').map(s => s.trim()) : [],
        address: formData.address,
      });
      setSubmitted(true);
      fetchMyEvents();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setFormData({ eventName: '', eventType: '', date: '', estimatedSurplus: '', foodTypes: '', address: '', specialNotes: '' });
    setError('');
  };

  const renderMyEvents = () => {
    if (eventsLoading) {
      return (
        <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--color-bark-light)' }}>
          <p>Loading your events...</p>
        </div>
      );
    }

    if (myEvents.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--color-bark-light)' }}>
          <p style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>📅</p>
          <h3>No events yet</h3>
          <p>Create your first event to pre-register surplus food for NGO pickup.</p>
          <button className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }} onClick={() => setActiveView('create')}>
            <FiPlus /> Create Event
          </button>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        {myEvents.map((event, index) => {
          const totalClaimed = event.claims?.reduce((sum, c) => sum + (c.quantityClaimed || 0), 0) || 0;
          const surplusQty = event.surplusQuantity || 0;
          const claimPercent = surplusQty > 0 ? Math.min((totalClaimed / surplusQty) * 100, 100) : 0;
          const eventIcon = EVENT_TYPES.find(t => t.id === event.eventType)?.icon || '🎉';
          const status = event.displayStatus || event.status || 'upcoming';
          const statusBadgeClass = status === 'completed' ? 'badge-olive'
            : status === 'expired' ? 'badge-wine'
            : status === 'active' ? 'badge-ochre' : 'badge-sage';

          return (
            <motion.div
              key={event._id}
              className="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              style={{ padding: 'var(--space-6)', opacity: status === 'expired' ? 0.7 : 1 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <span style={{ fontSize: '2rem' }}>{eventIcon}</span>
                  <div>
                    <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-1)' }}>{event.eventName}</h3>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-bark-light)' }}>
                      {EVENT_TYPES.find(t => t.id === event.eventType)?.label || 'Event'}
                    </p>
                  </div>
                </div>
                <span className={`badge ${statusBadgeClass}`}>
                  {status === 'completed' ? '✅ Completed' : status === 'expired' ? '⏰ Expired' : status}
                </span>
              </div>

              {/* Meta info */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', marginTop: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--color-bark-light)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                  <FiCalendar size={14} />
                  {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
                {event.location?.address && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                    <FiMapPin size={14} /> {event.location.address}
                  </span>
                )}
                {event.estimatedSurplus && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                    <FiUsers size={14} /> ~{event.estimatedSurplus} surplus
                  </span>
                )}
              </div>

              {/* Surplus capacity bar */}
              {surplusQty > 0 && (
                <div style={{ marginTop: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)', fontSize: 'var(--text-sm)' }}>
                    <span style={{ fontWeight: 600 }}>NGO Claims</span>
                    <span style={{ color: 'var(--color-bark-light)' }}>
                      {totalClaimed} / {surplusQty} {event.surplusUnit || 'meals'} claimed
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className={`progress-fill ${claimPercent >= 100 ? 'full' : ''}`} style={{ width: `${claimPercent}%` }}></div>
                  </div>
                </div>
              )}

              {/* Subscribed NGOs */}
              <div style={{ marginTop: 'var(--space-4)' }}>
                <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-2)', fontFamily: 'var(--font-body)' }}>
                  Subscribed NGOs ({event.subscribedNgos?.length || 0})
                </h4>
                {event.subscribedNgos?.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                    {event.subscribedNgos.map((ngo, i) => (
                      <span key={i} className="badge badge-olive" style={{ padding: 'var(--space-1) var(--space-3)' }}>
                        {typeof ngo === 'string' ? 'NGO' : (ngo.ngoDetails?.organizationName || ngo.name || 'NGO')}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-bark-light)' }}>
                    No NGOs subscribed yet. They'll appear here when they do.
                  </p>
                )}
              </div>

              {/* Claims breakdown */}
              {event.claims?.length > 0 && (
                <div style={{ marginTop: 'var(--space-3)' }}>
                  <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-2)', fontFamily: 'var(--font-body)' }}>
                    Claims
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                    {event.claims.map((c, i) => (
                      <span key={i} className="event-claim-chip" style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-1) var(--space-3)' }}>
                        {c.ngoName}: {c.quantityClaimed} {event.surplusUnit || 'meals'}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Pickup Info — from NGOs */}
              {event.pickups?.length > 0 && (
                <div style={{ marginTop: 'var(--space-4)' }}>
                  <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-2)', fontFamily: 'var(--font-body)' }}>
                    🚚 Scheduled Pickups ({event.pickups.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    {event.pickups.map((p, i) => (
                      <div key={i} style={{
                        padding: 'var(--space-2) var(--space-3)',
                        background: 'rgba(107, 127, 59, 0.06)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 'var(--text-xs)',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 'var(--space-3)',
                        alignItems: 'center',
                      }}>
                        <span style={{ fontWeight: 600, color: 'var(--color-olive)' }}>
                          {p.ngo?.ngoDetails?.organizationName || p.ngo?.name || 'NGO'}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-bark)' }}>
                          <FiUsers size={11} />
                          {p.driver && p.driver !== 'Unassigned' ? p.driver : 'Driver pending'}
                        </span>
                        {p.contact && (
                          <span style={{ color: 'var(--color-info)' }}>
                            📞 {p.contact}
                          </span>
                        )}
                        <span style={{ color: 'var(--color-ochre)' }}>
                          🕐 {new Date(p.scheduledTime).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {p.notes && (
                          <span style={{ color: 'var(--color-bark-light)', fontStyle: 'italic' }}>
                            "{p.notes}"
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderCreateForm = () => {
    if (submitted) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: 'center', padding: 'var(--space-16) var(--space-8)' }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            style={{ fontSize: '5rem', marginBottom: 'var(--space-6)' }}
          >
            🎊
          </motion.div>
          <h2 style={{ marginBottom: 'var(--space-4)' }}>Event Registered!</h2>
          <p style={{ color: 'var(--color-bark-light)', fontSize: 'var(--text-lg)', maxWidth: '500px', margin: '0 auto var(--space-6)' }}>
            Your event has been listed. NGOs in your area will be notified and can subscribe
            for pickup.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => { resetForm(); }}>
              Register Another Event
            </button>
            <button className="btn btn-secondary" onClick={() => { resetForm(); setActiveView('my-events'); }}>
              <FiEye /> View My Events
            </button>
          </div>
        </motion.div>
      );
    }

    return (
      <div className="donate-form-wrapper">
        <div className="card" style={{ padding: 'var(--space-8)' }}>
          {error && (
            <div style={{
              padding: 'var(--space-3) var(--space-4)',
              background: 'rgba(114, 47, 55, 0.08)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-wine)',
              fontSize: 'var(--text-sm)',
              marginBottom: 'var(--space-4)',
            }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Event Type</label>
            <div className="food-type-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}>
              {EVENT_TYPES.map((type) => (
                <button
                  key={type.id}
                  className={`food-type-option ${formData.eventType === type.id ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, eventType: type.id })}
                >
                  <span className="food-type-icon">{type.icon}</span>
                  <span className="food-type-label" style={{ fontSize: 'var(--text-xs)' }}>{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="event-name">Event Name</label>
            <input
              type="text"
              id="event-name"
              className="form-input"
              placeholder="e.g., Sharma Family Wedding Reception"
              value={formData.eventName}
              onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="event-date">
                <FiCalendar style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                Event Date & Time
              </label>
              <input
                type="datetime-local"
                id="event-date"
                className="form-input"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="event-surplus">
                <FiUsers style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                Estimated Surplus
              </label>
              <input
                type="text"
                id="event-surplus"
                className="form-input"
                placeholder="e.g., 200 meals, 50 kg"
                value={formData.estimatedSurplus}
                onChange={(e) => setFormData({ ...formData, estimatedSurplus: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="event-food-types">Types of Food Expected</label>
            <input
              type="text"
              id="event-food-types"
              className="form-input"
              placeholder="e.g., Biryani, Paneer dishes, Desserts"
              value={formData.foodTypes}
              onChange={(e) => setFormData({ ...formData, foodTypes: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="event-address">
              <FiMapPin style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              Event Venue Address
            </label>
            <input
              type="text"
              id="event-address"
              className="form-input"
              placeholder="Full address of the event venue"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="event-notes">Special Notes for NGOs</label>
            <textarea
              id="event-notes"
              className="form-textarea"
              placeholder="Any special instructions, entry gates, contact person, etc."
              value={formData.specialNotes}
              onChange={(e) => setFormData({ ...formData, specialNotes: e.target.value })}
              rows={3}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
            <button
              className="btn btn-primary btn-lg"
              onClick={handleSubmit}
              disabled={submitting}
              id="submit-event"
            >
              <FiCheck /> {submitting ? 'Registering...' : 'Register Event Donation'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 style={{ marginBottom: 'var(--space-2)' }}>
        <FiCalendar style={{ verticalAlign: 'middle', marginRight: '8px' }} />
        Event Food Donation
      </h2>
      <p style={{ color: 'var(--color-bark-light)', marginBottom: 'var(--space-6)' }}>
        Planning a wedding, corporate event, or festival? Pre-register surplus food so nearby
        NGOs can plan pickups in advance.
      </p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
        <button
          className={`btn btn-sm ${activeView === 'my-events' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveView('my-events')}
        >
          <FiEye size={14} /> My Events
        </button>
        <button
          className={`btn btn-sm ${activeView === 'create' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => { setActiveView('create'); resetForm(); }}
        >
          <FiPlus size={14} /> Create Event
        </button>
      </div>

      {activeView === 'my-events' ? renderMyEvents() : renderCreateForm()}
    </motion.div>
  );
}
