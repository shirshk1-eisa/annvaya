import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTruck, FiPhone, FiClock, FiUser } from 'react-icons/fi';
import { getFoodEmoji, getTimeAgo, getStatusLabel, getTimeUntil } from '../../utils/mockData';
import { donationsAPI } from '../../utils/api';
import { getSocket } from '../../utils/socket';

export default function MyDonations() {
  const [donations, setDonations] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const data = await donationsAPI.getMy(showHistory);
      setDonations(data.donations || []);
    } catch (err) {
      console.error('Failed to load donations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [showHistory]);

  // Listen for real-time updates
  useEffect(() => {
    const socket = getSocket();
    const handleUpdate = (donation) => {
      setDonations(prev => {
        const exists = prev.find(d => d._id === donation._id);
        if (exists) {
          return prev.map(d => d._id === donation._id ? { ...d, ...donation } : d);
        }
        return prev;
      });
    };
    const handlePickupUpdate = (pickup) => {
      // When a pickup is created/updated, refresh to get latest pickup info
      fetchDonations();
    };
    socket?.on('donation-status-changed', handleUpdate);
    socket?.on('donation-accepted', handleUpdate);
    socket?.on('pickup-update', handlePickupUpdate);
    return () => {
      socket?.off('donation-status-changed', handleUpdate);
      socket?.off('donation-accepted', handleUpdate);
      socket?.off('pickup-update', handlePickupUpdate);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        <h2>My Donations</h2>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button
            className={`btn btn-sm ${!showHistory ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setShowHistory(false)}
          >
            Active
          </button>
          <button
            className={`btn btn-sm ${showHistory ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setShowHistory(true)}
          >
            📜 History
          </button>
        </div>
      </div>
      <p style={{ color: 'var(--color-bark-light)', marginBottom: 'var(--space-6)' }}>
        {showHistory ? 'Previously completed or expired donations' : 'Track all your food donations and their current status'}
      </p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--color-bark-light)' }}>
          <p>Loading...</p>
        </div>
      ) : (
        <div className="donation-list">
          {donations.map((donation, index) => {
            const pickup = donation.pickup;
            const ngoName = pickup?.ngo?.ngoDetails?.organizationName || pickup?.ngo?.name ||
                            donation.acceptedBy?.ngoDetails?.organizationName || donation.acceptedBy?.name || null;

            return (
              <motion.div
                key={donation._id}
                className="donation-item card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <div className="donation-item-icon">
                  {getFoodEmoji(donation.foodType)}
                </div>
                <div className="donation-item-info" style={{ minWidth: 0 }}>
                  <h4>{donation.title}</h4>
                  <div className="donation-item-meta" style={{ flexWrap: 'wrap' }}>
                    <span>{donation.quantity}</span>
                    <span>•</span>
                    <span>{donation.location?.address || ''}</span>
                    <span>•</span>
                    <span>{getTimeAgo(donation.createdAt)}</span>
                  </div>

                  {/* Accepted by NGO */}
                  {ngoName && (
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-olive)', marginTop: 'var(--space-1)', display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                      <FiUser size={11} /> Accepted by: <strong>{ngoName}</strong>
                    </div>
                  )}

                  {/* Pickup Details — driver, phone, time */}
                  {pickup && (
                    <div style={{
                      marginTop: 'var(--space-2)',
                      padding: 'var(--space-2) var(--space-3)',
                      background: 'rgba(107, 127, 59, 0.06)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 'var(--text-xs)',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 'var(--space-3)',
                      alignItems: 'center',
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: 'var(--color-bark)' }}>
                        <FiTruck size={12} />
                        {pickup.driver && pickup.driver !== 'Unassigned' ? pickup.driver : 'Driver pending'}
                      </span>
                      {pickup.contact && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-info)' }}>
                          <FiPhone size={11} />
                          {pickup.contact}
                        </span>
                      )}
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-ochre)' }}>
                        <FiClock size={11} />
                        {new Date(pickup.scheduledTime).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {pickup.notes && (
                        <span style={{ color: 'var(--color-bark-light)', fontStyle: 'italic' }}>
                          "{pickup.notes}"
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <span className={`donation-item-status status-${donation.status === 'pickup_scheduled' ? 'pickup' : donation.status}`}>
                  <span className={`status-dot ${donation.status.split('_')[0]}`}></span>
                  {getStatusLabel(donation.status)}
                </span>
                {donation.bestBefore && (
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-bark-light)', textAlign: 'right' }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-bark)' }}>
                      {getTimeUntil(donation.bestBefore)}
                    </div>
                    <div>best before</div>
                  </div>
                )}
              </motion.div>
            );
          })}

          {donations.length === 0 && (
            <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--color-bark-light)' }}>
              <p style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>
                {showHistory ? '📜' : '🍽️'}
              </p>
              <h3>{showHistory ? 'No history yet' : 'No donations yet'}</h3>
              <p>{showHistory ? 'Completed donations will appear here' : 'Start your journey by donating your first meal!'}</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
