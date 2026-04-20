import { motion } from 'framer-motion';
import { FiTruck, FiClock, FiCheck, FiLoader, FiX } from 'react-icons/fi';
import { getFoodEmoji, getTimeAgo } from '../../utils/mockData';
import { pickupsAPI } from '../../utils/api';

export default function PickupManager({ pickups, onRefresh }) {
  const statusConfig = {
    'pending': { label: 'Pending', icon: <FiClock />, className: 'pending', color: 'var(--color-ochre)' },
    'in-progress': { label: 'In Progress', icon: <FiLoader />, className: 'in-progress', color: 'var(--color-info)' },
    'completed': { label: 'Completed', icon: <FiCheck />, className: 'completed', color: 'var(--color-olive)' }
  };

  const activePickups = pickups.filter(p => p.status !== 'completed' && p.status !== 'cancelled');
  const completedPickups = pickups.filter(p => p.status === 'completed');

  const handleMarkCompleted = async (pickupId) => {
    try {
      await pickupsAPI.updateStatus(pickupId, 'completed');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to complete pickup:', err);
    }
  };

  const handleCancelPickup = async (pickupId) => {
    try {
      await pickupsAPI.cancel(pickupId);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to cancel pickup:', err);
    }
  };

  const handleStartPickup = async (pickupId) => {
    try {
      await pickupsAPI.updateStatus(pickupId, 'in-progress');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to start pickup:', err);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h2 style={{ marginBottom: 'var(--space-2)' }}>
        <FiTruck style={{ verticalAlign: 'middle', marginRight: '8px' }} />
        Pickup Manager
      </h2>
      <p style={{ color: 'var(--color-bark-light)', marginBottom: 'var(--space-8)' }}>
        Manage all your scheduled and active pickups in one place
      </p>

      {/* Active Pickups */}
      {activePickups.length > 0 && (
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <h3 style={{ marginBottom: 'var(--space-4)' }}>Active Pickups</h3>
          <div className="pickup-timeline">
            {activePickups.map((pickup, index) => {
              const config = statusConfig[pickup.status] || statusConfig['pending'];
              const donation = pickup.donation || {};
              const event = pickup.event || {};
              const isEventPickup = !!pickup.event;
              const title = isEventPickup ? (event.eventName || 'Event Pickup') : (donation.title || 'Donation');
              const icon = isEventPickup ? '📅' : getFoodEmoji(donation.foodType);
              const subtitle = isEventPickup
                ? `${event.estimatedSurplus || ''} • ${event.location?.address || ''}`
                : `${donation.quantity || ''} • ${donation.location?.address || ''}`;
              return (
                <motion.div
                  key={pickup._id}
                  className="pickup-card card"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={`pickup-status-indicator ${config.className}`}>
                    {config.icon}
                  </div>
                  <div className="pickup-info">
                    <h4>
                      {icon} {title}
                      {isEventPickup && <span className="badge badge-ochre" style={{ marginLeft: '8px', fontSize: '0.6rem' }}>EVENT</span>}
                    </h4>
                    <p>
                      {subtitle}
                    </p>
                    <p style={{ marginTop: 'var(--space-1)' }}>
                      <strong>Driver:</strong> {pickup.driver}
                      {pickup.notes && <span> • {pickup.notes}</span>}
                    </p>
                  </div>
                  <div className="pickup-time">
                    <strong>
                      {new Date(pickup.scheduledTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </strong>
                    {new Date(pickup.scheduledTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    <div style={{ marginTop: 'var(--space-2)', display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                      <span className={`badge ${pickup.status === 'pending' ? 'badge-ochre' : 'badge-info'}`}>
                        {config.label}
                      </span>
                    </div>
                    <div style={{ marginTop: 'var(--space-2)', display: 'flex', gap: 'var(--space-2)' }}>
                      {pickup.status === 'pending' && (
                        <button className="btn btn-sm btn-olive" onClick={() => handleStartPickup(pickup._id)}>
                          Start
                        </button>
                      )}
                      {pickup.status === 'in-progress' && (
                        <button className="btn btn-sm btn-olive" onClick={() => handleMarkCompleted(pickup._id)}>
                          <FiCheck size={12} /> Done
                        </button>
                      )}
                      <button
                        className="btn btn-sm"
                        onClick={() => handleCancelPickup(pickup._id)}
                        style={{ background: 'rgba(114,47,55,0.08)', color: 'var(--color-wine)', border: '1px solid rgba(114,47,55,0.2)' }}
                      >
                        <FiX size={12} /> Cancel
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Pickups */}
      {completedPickups.length > 0 && (
        <div>
          <h3 style={{ marginBottom: 'var(--space-4)', color: 'var(--color-bark-light)' }}>
            ✅ Completed
          </h3>
          <div className="pickup-timeline">
            {completedPickups.map((pickup, index) => {
              const donation = pickup.donation || {};
              const event = pickup.event || {};
              const isEventPickup = !!pickup.event;
              const title = isEventPickup ? (event.eventName || 'Event Pickup') : (donation.title || 'Donation');
              const icon = isEventPickup ? '📅' : getFoodEmoji(donation.foodType);
              return (
                <motion.div
                  key={pickup._id}
                  className="pickup-card card card-flat"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  style={{ opacity: 0.75 }}
                >
                  <div className="pickup-status-indicator completed">
                    <FiCheck />
                  </div>
                  <div className="pickup-info">
                    <h4>
                      {icon} {title}
                    </h4>
                    <p>{donation.quantity || event.estimatedSurplus || ''} • {pickup.driver}</p>
                  </div>
                  <div className="pickup-time">
                    <strong>
                      {new Date(pickup.scheduledTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </strong>
                    {new Date(pickup.scheduledTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    <div style={{ marginTop: 'var(--space-2)' }}>
                      <span className="badge badge-olive">Completed</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {pickups.length === 0 && (
        <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--color-bark-light)' }}>
          <p style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>🚚</p>
          <h3>No pickups scheduled</h3>
          <p>Accept a donation to create your first pickup</p>
        </div>
      )}
    </motion.div>
  );
}
