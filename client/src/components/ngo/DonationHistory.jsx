import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTruck, FiPhone, FiClock } from 'react-icons/fi';
import { getFoodEmoji, getTimeAgo, getStatusLabel } from '../../utils/mockData';
import { donationsAPI, pickupsAPI } from '../../utils/api';

export default function DonationHistory() {
  const [donations, setDonations] = useState([]);
  const [eventPickups, setEventPickups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const [donationData, pickupData] = await Promise.all([
          donationsAPI.getAll({ history: 'true' }),
          pickupsAPI.getAll(true) // completed pickups
        ]);
        setDonations(donationData.donations || []);
        // Filter only event pickups (donation pickups are already shown above)
        setEventPickups((pickupData.pickups || []).filter(p => p.event));
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const hasHistory = donations.length > 0 || eventPickups.length > 0;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div style={{ marginBottom: 'var(--space-2)' }}>
        <h2>📜 Donation & Event History</h2>
      </div>
      <p style={{ color: 'var(--color-bark-light)', marginBottom: 'var(--space-6)' }}>
        All completed donations and event pickups your organization has been involved with
      </p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--color-bark-light)' }}>
          <p>Loading history...</p>
        </div>
      ) : !hasHistory ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--color-bark-light)' }}>
          <p style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>📜</p>
          <h3>No history yet</h3>
          <p>Completed donations and event pickups will appear here.</p>
        </div>
      ) : (
        <>
          {/* Donation History */}
          {donations.length > 0 && (
            <div style={{ marginBottom: 'var(--space-8)' }}>
              <h3 style={{ marginBottom: 'var(--space-4)' }}>🍽️ Donations ({donations.length})</h3>
              <div className="donation-list">
                {donations.map((donation, index) => (
                  <motion.div
                    key={donation._id}
                    className="donation-item card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06 }}
                  >
                    <div className="donation-item-icon">
                      {getFoodEmoji(donation.foodType)}
                    </div>
                    <div className="donation-item-info">
                      <h4>{donation.title}</h4>
                      <div className="donation-item-meta">
                        <span>{donation.quantity}</span>
                        <span>•</span>
                        <span>by {donation.donor?.name || 'Anonymous'}</span>
                        <span>•</span>
                        <span>{donation.location?.address || ''}</span>
                        <span>•</span>
                        <span>{getTimeAgo(donation.createdAt)}</span>
                      </div>
                    </div>
                    <span className={`donation-item-status status-${donation.status}`}>
                      <span className={`status-dot ${donation.status}`}></span>
                      {getStatusLabel(donation.status)}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Event Pickup History */}
          {eventPickups.length > 0 && (
            <div>
              <h3 style={{ marginBottom: 'var(--space-4)' }}>📅 Event Pickups ({eventPickups.length})</h3>
              <div className="donation-list">
                {eventPickups.map((pickup, index) => {
                  const event = pickup.event || {};
                  return (
                    <motion.div
                      key={pickup._id}
                      className="donation-item card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.06 }}
                    >
                      <div className="donation-item-icon">📅</div>
                      <div className="donation-item-info">
                        <h4>
                          {event.eventName || 'Event Pickup'}
                          <span className="badge badge-ochre" style={{ marginLeft: '8px', fontSize: '0.6rem' }}>EVENT</span>
                        </h4>
                        <div className="donation-item-meta" style={{ flexWrap: 'wrap' }}>
                          <span>{event.estimatedSurplus || ''}</span>
                          <span>•</span>
                          <span>by {event.organizer?.name || 'Organizer'}</span>
                          <span>•</span>
                          <span>{event.location?.address || ''}</span>
                        </div>
                        <div style={{ marginTop: 'var(--space-1)', fontSize: 'var(--text-xs)', color: 'var(--color-bark-light)', display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FiTruck size={11} /> {pickup.driver}
                          </span>
                          {pickup.contact && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <FiPhone size={11} /> {pickup.contact}
                            </span>
                          )}
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FiClock size={11} />
                            {new Date(pickup.scheduledTime).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      <span className="donation-item-status status-delivered">
                        <span className="status-dot delivered"></span>
                        Completed
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
