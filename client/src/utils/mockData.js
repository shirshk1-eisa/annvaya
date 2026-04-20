// Utility helpers for the Annvaya platform (no mock data — all real API data)
import chipsIcon from '../assets/images/food-icons/chips_packet.png';

// Helper functions
export function getTimeAgo(dateString) {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function getTimeUntil(dateString) {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = date - now;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs < 0) return 'Expired';
  if (diffHours < 1) return 'Less than 1 hr';
  if (diffHours < 24) return `${diffHours} hrs left`;
  return `${diffDays} days left`;
}

export function getFoodEmoji(foodType) {
  const emojis = {
    cooked: '🍛',
    raw: '🥬',
    packaged: '🧧',
    beverages: '🥤',
    mixed: '🍱🥤🍫'
  };
  return emojis[foodType] || '🍽️';
}

export function getFoodIcon(foodType) {
  const icons = {
    packaged: chipsIcon,
  };
  return icons[foodType] || null;
}

export function getEventEmoji(eventType) {
  const emojis = {
    wedding: '💒',
    corporate: '🏢',
    festival: '🪔',
    community: '🌿',
    other: '🎉'
  };
  return emojis[eventType] || '🎉';
}

export function getStatusLabel(status) {
  const labels = {
    available: 'Available',
    accepted: 'Accepted',
    pickup_scheduled: 'Pickup Scheduled',
    picked_up: 'Picked Up',
    delivered: 'Delivered',
    expired: 'Expired'
  };
  return labels[status] || status;
}

export function getUrgencyLabel(urgency) {
  const labels = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    critical: 'Critical'
  };
  return labels[urgency] || urgency;
}
