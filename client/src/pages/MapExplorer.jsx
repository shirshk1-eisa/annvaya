import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiMapPin, FiClock } from 'react-icons/fi';
import { getFoodEmoji, getTimeAgo, getTimeUntil } from '../utils/mockData';
import { donationsAPI } from '../utils/api';
import Navbar from '../components/common/Navbar';

export default function MapExplorer() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [allDonations, setAllDonations] = useState([]);

  useEffect(() => {
    donationsAPI.getAll()
      .then(data => setAllDonations(data.donations || []))
      .catch(err => console.error('Failed to load donations:', err));
  }, []);

  const available = allDonations.filter(d => d.status === 'available');
  const filtered = filter === 'all'
    ? available
    : available.filter(d => d.foodType === filter);

  const searchFiltered = search
    ? filtered.filter(d =>
        d.title.toLowerCase().includes(search.toLowerCase()) ||
        (d.location?.address || '').toLowerCase().includes(search.toLowerCase())
      )
    : filtered;

  return (
    <>
      <Navbar />
      <div className="map-page" id="map-explorer">
        {/* Sidebar */}
        <div className="map-sidebar">
          <h2 className="map-sidebar-title">🗺️ Explore Donations</h2>

          <div className="map-search">
            <div className="input-wrapper">
              <FiSearch className="input-icon" />
              <input
                type="text"
                className="form-input with-icon"
                placeholder="Search by food or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                id="map-search-input"
              />
            </div>
          </div>

          <div className="map-filters">
            {[
              { id: 'all', label: 'All' },
              { id: 'cooked', label: '🍛 Cooked' },
              { id: 'raw', label: '🥬 Raw' },
              { id: 'packaged', label: '📦 Packaged' },
            ].map((f) => (
              <button
                key={f.id}
                className={`map-filter-chip ${filter === f.id ? 'active' : ''}`}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <p className="map-results-count">
            {searchFiltered.length} donations found
          </p>

          <div className="map-donation-list">
            {searchFiltered.map((donation, index) => (
              <motion.div
                key={donation._id}
                className={`map-donation-card ${selectedDonation?._id === donation._id ? 'selected' : ''}`}
                onClick={() => setSelectedDonation(donation)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                style={selectedDonation?._id === donation._id ? { borderColor: 'var(--color-earth)', background: 'rgba(193, 105, 79, 0.04)' } : {}}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span style={{ fontSize: '1.3rem' }}>{getFoodEmoji(donation.foodType)}</span>
                    <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{donation.title}</h4>
                  </div>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-bark-light)', whiteSpace: 'nowrap' }}>
                    {getTimeAgo(donation.createdAt)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--color-bark-light)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FiMapPin size={11} />
                    {(donation.location?.address || '').split(',')[0]}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FiClock size={11} />
                    {getTimeUntil(donation.bestBefore)}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                  <span className="donation-card-tag">{donation.quantity}</span>
                  {(donation.dietaryInfo || []).map((d, i) => (
                    <span key={i} className="donation-card-tag" style={{ background: 'rgba(107, 127, 59, 0.08)', color: 'var(--color-olive)' }}>
                      {d}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}

            {searchFiltered.length === 0 && (
              <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-bark-light)' }}>
                <p style={{ fontSize: '2rem', marginBottom: 'var(--space-3)' }}>🔍</p>
                <p>No donations found matching your search</p>
              </div>
            )}
          </div>
        </div>

        {/* Map Area */}
        <div className="map-container" style={{
          background: 'linear-gradient(135deg, var(--color-sand-light) 0%, var(--color-cream) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative map illustration */}
          <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>🗺️</div>
            <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: 'var(--space-2)', color: 'var(--color-bark)' }}>
              Interactive Map
            </h3>
            <p style={{ color: 'var(--color-bark-light)', maxWidth: '400px', lineHeight: 1.6 }}>
              Connect a Leaflet or Google Maps API to see donation pins,
              NGO locations, and active pickups on a real map.
            </p>
            <div style={{ marginTop: 'var(--space-6)', display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--color-olive)', display: 'inline-block' }}></span>
                Available Donations
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--color-info)', display: 'inline-block' }}></span>
                NGO Locations
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--color-ochre)', display: 'inline-block' }}></span>
                Active Pickups
              </div>
            </div>
          </div>

          {/* Floating pins for visual effect */}
          {[
            { top: '20%', left: '25%', color: 'var(--color-olive)', emoji: '🥬' },
            { top: '35%', left: '60%', color: 'var(--color-earth)', emoji: '🍛' },
            { top: '55%', left: '40%', color: 'var(--color-ochre)', emoji: '📦' },
            { top: '30%', left: '75%', color: 'var(--color-info)', emoji: '🏛️' },
            { top: '65%', left: '70%', color: 'var(--color-olive)', emoji: '🍛' },
            { top: '45%', left: '20%', color: 'var(--color-info)', emoji: '🏛️' },
            { top: '70%', left: '30%', color: 'var(--color-ochre)', emoji: '🥤' },
          ].map((pin, i) => (
            <motion.div
              key={i}
              style={{
                position: 'absolute',
                top: pin.top,
                left: pin.left,
                width: 40,
                height: 40,
                borderRadius: '50% 50% 50% 0',
                background: pin.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: 'rotate(-45deg)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                cursor: 'pointer'
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.85 }}
              transition={{ delay: 0.3 + i * 0.1, type: 'spring', stiffness: 200 }}
              whileHover={{ scale: 1.2, opacity: 1 }}
            >
              <span style={{ transform: 'rotate(45deg)', fontSize: '1rem' }}>{pin.emoji}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
}
