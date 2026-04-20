import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiMapPin, FiUsers, FiCheck, FiX, FiTruck, FiPhone, FiClock } from 'react-icons/fi';
import { eventsAPI, pickupsAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { getSocket } from '../../utils/socket';

const EVENT_ICONS = {
  wedding: '💒',
  corporate: '🏢',
  festival: '🪔',
  community: '🌿',
  other: '🎉',
};

export default function BrowseEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claimAmounts, setClaimAmounts] = useState({});
  const [pickupForm, setPickupForm] = useState(null); // event ID
  const [pickupData, setPickupData] = useState({ driver: '', contact: '', scheduledTime: '', notes: '' });
  const [pickupSubmitting, setPickupSubmitting] = useState(false);
  const [myPickupEventIds, setMyPickupEventIds] = useState(new Set()); // events this NGO already has active pickups for
  const [pickupError, setPickupError] = useState('');
  const { user } = useAuth();

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

  // Fetch existing pickups to prevent duplicates
  const fetchMyPickups = async () => {
    try {
      const data = await pickupsAPI.getAll(false); // active pickups
      const eventIds = new Set();
      for (const p of (data.pickups || [])) {
        if (p.event) {
          const eid = typeof p.event === 'string' ? p.event : p.event._id;
          eventIds.add(eid);
        }
      }
      setMyPickupEventIds(eventIds);
    } catch (err) {
      console.error('Failed to load pickups:', err);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchMyPickups();
  }, []);

  // Real-time event updates
  useEffect(() => {
    const socket = getSocket();
    const handleNewEvent = (event) => {
      setEvents(prev => {
        if (prev.find(e => e._id === event._id)) return prev;
        return [event, ...prev];
      });
    };
    const handleEventUpdated = (event) => {
      setEvents(prev => prev.map(e => e._id === event._id ? event : e));
    };
    socket?.on('new-event', handleNewEvent);
    socket?.on('event-updated', handleEventUpdated);
    return () => {
      socket?.off('new-event', handleNewEvent);
      socket?.off('event-updated', handleEventUpdated);
    };
  }, []);

  const isSubscribed = (event) => {
    return event.subscribedNgos?.some(
      n => (typeof n === 'string' ? n : n._id) === user?._id
    );
  };

  const handleSubscribe = async (eventId) => {
    try {
      await eventsAPI.subscribe(eventId);
      fetchEvents();
    } catch (err) {
      console.error('Failed to subscribe:', err);
    }
  };

  const handleUnsubscribe = async (eventId) => {
    try {
      await eventsAPI.unsubscribe(eventId);
      fetchEvents();
    } catch (err) {
      console.error('Failed to unsubscribe:', err);
    }
  };

  const handleClaim = async (eventId) => {
    const qty = parseInt(claimAmounts[eventId]);
    if (!qty || qty <= 0) return;
    try {
      await eventsAPI.claim(eventId, qty);
      setClaimAmounts(prev => ({ ...prev, [eventId]: '' }));
      fetchEvents();
    } catch (err) {
      console.error('Failed to claim:', err);
    }
  };

  const handleSchedulePickup = async (eventId) => {
    if (!pickupData.scheduledTime) return;
    try {
      setPickupSubmitting(true);
      setPickupError('');
      await pickupsAPI.create({
        eventId,
        driver: pickupData.driver,
        contact: pickupData.contact,
        scheduledTime: pickupData.scheduledTime,
        notes: pickupData.notes,
      });
      setPickupForm(null);
      setPickupData({ driver: '', contact: '', scheduledTime: '', notes: '' });
      // Track this event as having an active pickup now
      setMyPickupEventIds(prev => new Set([...prev, eventId]));
    } catch (err) {
      console.error('Failed to schedule pickup:', err);
      setPickupError(err.message || 'Failed to schedule pickup');
    } finally {
      setPickupSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div style={{ marginBottom: 'var(--space-2)' }}>
        <h2>
          <FiCalendar style={{ verticalAlign: 'middle', marginRight: '8px' }} />
          Browse Events
        </h2>
      </div>
      <p style={{ color: 'var(--color-bark-light)', marginBottom: 'var(--space-6)' }}>
        View upcoming events with surplus food. Subscribe to get notified and claim meals for pickup.
      </p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--color-bark-light)' }}>
          <p>Loading events...</p>
        </div>
      ) : events.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--color-bark-light)' }}>
          <p style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>📅</p>
          <h3>No events right now</h3>
          <p>Check back later — donors will post upcoming events here!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {events.map((event, index) => {
            const sub = isSubscribed(event);
            const totalClaimed = event.claims?.reduce((sum, c) => sum + (c.quantityClaimed || 0), 0) || 0;
            const surplusQty = event.surplusQuantity || 0;
            const claimPercent = surplusQty > 0 ? Math.min((totalClaimed / surplusQty) * 100, 100) : 0;
            const isFull = claimPercent >= 100;

            return (
              <motion.div
                key={event._id}
                className="card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                style={{ padding: 'var(--space-6)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <span style={{ fontSize: '2rem' }}>{EVENT_ICONS[event.eventType] || '🎉'}</span>
                    <div>
                      <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-1)' }}>{event.eventName}</h3>
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-bark-light)' }}>
                        by {event.organizer?.name || 'Donor'}
                      </p>
                    </div>
                  </div>
                  <span className={`badge ${event.status === 'upcoming' ? 'badge-olive' : event.status === 'active' ? 'badge-ochre' : 'badge-earth'}`}>
                    {event.status || 'upcoming'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', marginTop: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--color-bark-light)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                    <FiCalendar size={14} /> {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
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

                {event.foodTypes?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
                    {event.foodTypes.map((f, i) => (
                      <span key={i} className="badge badge-ochre">{f}</span>
                    ))}
                  </div>
                )}

                {/* Claim capacity bar */}
                {surplusQty > 0 && (
                  <div style={{ marginTop: 'var(--space-4)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)', fontSize: 'var(--text-sm)' }}>
                      <span style={{ fontWeight: 600 }}>Claimed capacity</span>
                      <span style={{ color: 'var(--color-bark-light)' }}>
                        {totalClaimed} / {surplusQty} {event.surplusUnit || 'meals'}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div className={`progress-fill ${isFull ? 'full' : ''}`} style={{ width: `${claimPercent}%` }}></div>
                    </div>
                  </div>
                )}

                {/* Claims list */}
                {event.claims?.length > 0 && (
                  <div style={{ marginTop: 'var(--space-3)', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)' }}>
                    {event.claims.map((c, i) => (
                      <span key={i} className="event-claim-chip">{c.ngoName}: {c.quantityClaimed}</span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'center' }}>
                  {sub ? (
                    <>
                      <span className="badge badge-olive" style={{ padding: 'var(--space-2) var(--space-3)' }}>
                        <FiCheck size={12} style={{ marginRight: '4px' }} /> Subscribed
                      </span>
                      <button className="btn btn-sm btn-ghost" onClick={() => handleUnsubscribe(event._id)}
                        style={{ color: 'var(--color-wine)', fontSize: 'var(--text-xs)' }}
                      >
                        <FiX size={12} /> Unsubscribe
                      </button>
                      {!isFull && surplusQty > 0 && (
                        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                          <input
                            type="number"
                            className="form-input"
                            placeholder="Qty"
                            min="1"
                            value={claimAmounts[event._id] || ''}
                            onChange={(e) => setClaimAmounts(prev => ({ ...prev, [event._id]: e.target.value }))}
                            style={{ width: '80px', padding: 'var(--space-2)' }}
                          />
                          <button className="btn btn-sm btn-olive" onClick={() => handleClaim(event._id)}>
                            Claim
                          </button>
                        </div>
                      )}
                      {myPickupEventIds.has(event._id) ? (
                        <span className="badge badge-olive" style={{ padding: 'var(--space-2) var(--space-3)' }}>
                          <FiTruck size={12} style={{ marginRight: '4px' }} /> Pickup Scheduled ✅
                        </span>
                      ) : (
                        <button className="btn btn-sm btn-ochre" onClick={() => { setPickupForm(pickupForm === event._id ? null : event._id); setPickupError(''); }}>
                          <FiTruck size={12} /> Schedule Pickup
                        </button>
                      )}
                    </>
                  ) : isFull ? (
                    <span className="badge badge-wine" style={{ padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--text-sm)' }}>
                      🔒 Fully Claimed — Subscription Closed
                    </span>
                  ) : (
                    <button className="btn btn-sm btn-olive" onClick={() => handleSubscribe(event._id)}>
                      Subscribe for Pickup
                    </button>
                  )}
                </div>

                {/* Pickup scheduling form */}
                {pickupForm === event._id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    style={{
                      marginTop: 'var(--space-4)',
                      padding: 'var(--space-4)',
                      background: 'rgba(212, 149, 43, 0.06)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid rgba(212, 149, 43, 0.15)',
                    }}
                  >
                    <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>
                      <FiTruck size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                      Schedule Pickup for this Event
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                      <div>
                        <label className="form-label" style={{ fontSize: 'var(--text-xs)' }}>Driver Name</label>
                        <input
                          type="text" className="form-input" placeholder="Driver name"
                          value={pickupData.driver}
                          onChange={(e) => setPickupData(prev => ({ ...prev, driver: e.target.value }))}
                          style={{ padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--text-sm)' }}
                        />
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: 'var(--text-xs)' }}>
                          <FiPhone size={11} style={{ verticalAlign: 'middle' }} /> Contact
                        </label>
                        <input
                          type="text" className="form-input" placeholder="Phone number"
                          value={pickupData.contact}
                          onChange={(e) => setPickupData(prev => ({ ...prev, contact: e.target.value }))}
                          style={{ padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--text-sm)' }}
                        />
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: 'var(--text-xs)' }}>
                          <FiClock size={11} style={{ verticalAlign: 'middle' }} /> Pickup Time *
                        </label>
                        <input
                          type="datetime-local" className="form-input"
                          value={pickupData.scheduledTime}
                          onChange={(e) => setPickupData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                          style={{ padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--text-sm)' }}
                        />
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: 'var(--text-xs)' }}>Notes</label>
                        <input
                          type="text" className="form-input" placeholder="Any instructions"
                          value={pickupData.notes}
                          onChange={(e) => setPickupData(prev => ({ ...prev, notes: e.target.value }))}
                          style={{ padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--text-sm)' }}
                        />
                      </div>
                    </div>
                    {pickupError && (
                      <div style={{
                        marginTop: 'var(--space-2)',
                        padding: 'var(--space-2) var(--space-3)',
                        background: 'rgba(114, 47, 55, 0.08)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--color-wine)',
                        fontSize: 'var(--text-xs)',
                      }}>
                        ⚠️ {pickupError}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)', justifyContent: 'flex-end' }}>
                      <button className="btn btn-sm btn-ghost" onClick={() => setPickupForm(null)}>Cancel</button>
                      <button
                        className="btn btn-sm btn-ochre"
                        onClick={() => handleSchedulePickup(event._id)}
                        disabled={pickupSubmitting || !pickupData.scheduledTime}
                      >
                        <FiTruck size={12} /> {pickupSubmitting ? 'Scheduling...' : 'Confirm Pickup'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
