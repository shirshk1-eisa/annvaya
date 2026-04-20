import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMapPin, FiClock, FiFilter, FiCheck, FiX, FiTruck, FiCalendar, FiPhone } from 'react-icons/fi';
import { getFoodEmoji, getFoodIcon, getTimeAgo, getTimeUntil } from '../../utils/mockData';
import { donationsAPI, pickupsAPI } from '../../utils/api';

export default function AvailableDonations({ donations, onRefresh }) {
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('list');
  const [acceptedIds, setAcceptedIds] = useState([]);
  const [scheduledPickups, setScheduledPickups] = useState({});
  const [showScheduleModal, setShowScheduleModal] = useState(null);
  const [pickupForm, setPickupForm] = useState({ time: '', driver: '', contact: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  const available = donations.filter(d => d.status === 'available');
  const filtered = filter === 'all' ? available : available.filter(d => d.foodType === filter);

  const handleAccept = (donation) => {
    setPickupForm({ time: '', driver: '', contact: '', notes: '' });
    setShowScheduleModal(donation);
  };

  const handleSchedulePickup = async () => {
    if (!showScheduleModal || submitting) return;
    const donationId = showScheduleModal._id || showScheduleModal.id;
    try {
      setSubmitting(true);
      await donationsAPI.accept(donationId);
      await pickupsAPI.create({
        donationId,
        scheduledTime: pickupForm.time || new Date().toISOString(),
        driver: pickupForm.driver || 'Unassigned',
        contact: pickupForm.contact || '',
        notes: pickupForm.notes || '',
      });
      setAcceptedIds(prev => [...prev, donationId]);
      setScheduledPickups(prev => ({
        ...prev,
        [donationId]: {
          time: pickupForm.time || 'ASAP',
          driver: pickupForm.driver || 'Unassigned',
          contact: pickupForm.contact || '',
          notes: pickupForm.notes,
          scheduledAt: new Date().toISOString()
        }
      }));
      // Refresh parent data
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to accept donation:', err);
      alert('Failed to accept: ' + err.message);
    } finally {
      setSubmitting(false);
    }
    setShowScheduleModal(null);
    setPickupForm({ time: '', driver: '', contact: '', notes: '' });
  };

  const handleCancelPickup = async (donationId) => {
    setAcceptedIds(prev => prev.filter(id => id !== donationId));
    setScheduledPickups(prev => {
      const updated = { ...prev };
      delete updated[donationId];
      return updated;
    });
    if (onRefresh) onRefresh();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h2 style={{ marginBottom: 'var(--space-2)' }}>Available Donations</h2>
          <p style={{ color: 'var(--color-bark-light)' }}>
            {filtered.length} donations available near you right now
          </p>
        </div>
        <div className="tabs">
          <button className={`tab ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>List</button>
          <button className={`tab ${viewMode === 'map' ? 'active' : ''}`} onClick={() => setViewMode('map')}>Map</button>
        </div>
      </div>

      {/* Filters */}
      <div className="map-filters" style={{ marginBottom: 'var(--space-6)', alignItems: 'center' }}>
        <FiFilter style={{ color: 'var(--color-bark-light)', marginRight: 'var(--space-1)' }} />
        {[
          { id: 'all', label: 'All' },
          { id: 'cooked', label: '🍛 Cooked' },
          { id: 'raw', label: '🥬 Raw' },
          { id: 'packaged', label: 'Packaged', useIcon: true },
          { id: 'beverages', label: '🥤 Beverages' },
          { id: 'mixed', label: '🍱🥤🍫 Mixed' },
        ].map((f) => (
          <button
            key={f.id}
            className={`map-filter-chip ${filter === f.id ? 'active' : ''}`}
            onClick={() => setFilter(f.id)}
            style={f.useIcon ? { display: 'inline-flex', alignItems: 'center', gap: '4px' } : {}}
          >
            {f.useIcon && <img src={getFoodIcon(f.id)} alt="" style={{ width: '18px', height: '18px', objectFit: 'contain', mixBlendMode: 'multiply' }} />}
            {f.label}
          </button>
        ))}
      </div>

      {viewMode === 'map' ? (
        <div style={{
          background: 'var(--color-sand-light)',
          borderRadius: 'var(--radius-lg)',
          height: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px dashed var(--color-sand)',
          fontFamily: 'var(--font-accent)',
          fontSize: 'var(--text-2xl)',
          color: 'var(--color-bark-light)',
          marginBottom: 'var(--space-6)'
        }}>
          🗺️ Map View — Connect a Map API to see pins
        </div>
      ) : null}

      {/* Donation Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <AnimatePresence>
          {filtered.map((donation, index) => {
            const did = donation._id || donation.id;
            const isAccepted = acceptedIds.includes(did);
            const pickupInfo = scheduledPickups[did];
            return (
              <motion.div
                key={did}
                className={`available-donation-card card ${isAccepted ? 'accepted' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                style={isAccepted ? { borderLeftColor: 'var(--color-olive)' } : {}}
              >
                <div className="donation-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <span style={{ fontSize: '1.8rem', display: 'inline-flex', alignItems: 'center' }}>
                      {getFoodIcon(donation.foodType)
                        ? <img src={getFoodIcon(donation.foodType)} alt="" style={{ width: '1.8rem', height: '1.8rem', objectFit: 'contain', mixBlendMode: 'multiply' }} />
                        : getFoodEmoji(donation.foodType)}
                    </span>
                    <div>
                      <h4 className="donation-card-title">{donation.title}</h4>
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-bark-light)' }}>
                        by {donation.donor.name}
                      </p>
                    </div>
                  </div>
                  <span className="donation-card-time">{getTimeAgo(donation.createdAt)}</span>
                </div>

                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-bark-light)', marginBottom: 'var(--space-3)', lineHeight: 1.6 }}>
                  {donation.description}
                </p>

                <div className="donation-card-details">
                  <span className="donation-card-tag">📦 {donation.quantity}</span>
                  <span className="donation-card-tag">⏰ {getTimeUntil(donation.bestBefore)}</span>
                  {donation.dietaryInfo.map((d, i) => (
                    <span key={i} className="donation-card-tag" style={{ background: 'rgba(107, 127, 59, 0.1)', color: 'var(--color-olive)' }}>
                      {d}
                    </span>
                  ))}
                </div>

                {/* Scheduled pickup info banner */}
                {isAccepted && pickupInfo && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    style={{
                      background: 'rgba(107, 127, 59, 0.08)',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--space-3) var(--space-4)',
                      marginBottom: 'var(--space-3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-3)',
                      flexWrap: 'wrap',
                      fontSize: 'var(--text-sm)'
                    }}
                  >
                    <FiTruck style={{ color: 'var(--color-olive)' }} />
                    <span style={{ fontWeight: 600, color: 'var(--color-olive)' }}>Pickup Scheduled</span>
                    <span style={{ color: 'var(--color-bark-light)' }}>
                      🕐 {pickupInfo.time} · 🚗 {pickupInfo.driver}
                      {pickupInfo.contact && ` · 📞 ${pickupInfo.contact}`}
                      {pickupInfo.notes && ` · 📝 ${pickupInfo.notes}`}
                    </span>
                  </motion.div>
                )}

                <div className="donation-card-footer">
                  <div className="donation-card-location">
                    <FiMapPin size={14} />
                    {donation.location?.address || ''}
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                    <span className="donation-card-distance">2.3 km away</span>
                    {isAccepted ? (
                      <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                        <motion.span
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                          className="badge badge-olive"
                          style={{ fontSize: 'var(--text-sm)', padding: 'var(--space-2) var(--space-3)' }}
                        >
                          <FiCheck size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                          Accepted
                        </motion.span>
                        <button
                          className="btn btn-sm"
                          onClick={() => handleCancelPickup(did)}
                          style={{
                            background: 'rgba(114, 47, 55, 0.08)',
                            color: 'var(--color-wine)',
                            border: '1px solid rgba(114, 47, 55, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <FiX size={14} /> Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        className="btn btn-olive btn-sm"
                        id={`accept-${did}`}
                        onClick={() => handleAccept(donation)}
                      >
                        Accept & Schedule Pickup
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--color-bark-light)' }}>
            <p style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>🔍</p>
            <h3>No donations found</h3>
            <p>Try changing the filter or check back soon!</p>
          </div>
        )}
      </div>

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

              {/* Form */}
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
                <button
                  className="btn btn-ghost"
                  onClick={() => setShowScheduleModal(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-olive"
                  onClick={handleSchedulePickup}
                >
                  <FiCheck size={16} /> Confirm & Schedule
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
