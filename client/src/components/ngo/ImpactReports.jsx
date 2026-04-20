import { motion } from 'framer-motion';
import { FiDownload } from 'react-icons/fi';

export default function ImpactReports() {
  const monthlyData = [
    { month: 'Oct', meals: 820 },
    { month: 'Nov', meals: 950 },
    { month: 'Dec', meals: 1100 },
    { month: 'Jan', meals: 1050 },
    { month: 'Feb', meals: 1180 },
    { month: 'Mar', meals: 1250 },
  ];

  const maxMeals = Math.max(...monthlyData.map(d => d.meals));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h2 style={{ marginBottom: 'var(--space-2)' }}>📊 Impact Reports</h2>
          <p style={{ color: 'var(--color-bark-light)' }}>
            Track the difference your organization is making
          </p>
        </div>
        <button className="btn btn-secondary btn-sm">
          <FiDownload /> Download Report
        </button>
      </div>

      {/* Summary Cards */}
      <div className="impact-summary-grid" style={{ marginBottom: 'var(--space-8)' }}>
        <motion.div className="impact-summary-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <span className="impact-icon">🍽️</span>
          <span className="impact-value">6,350</span>
          <span className="impact-label">Total Meals Served</span>
        </motion.div>
        <motion.div className="impact-summary-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <span className="impact-icon">♻️</span>
          <span className="impact-value">2,540 kg</span>
          <span className="impact-label">Food Saved from Waste</span>
        </motion.div>
        <motion.div className="impact-summary-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <span className="impact-icon">🤲</span>
          <span className="impact-value">142</span>
          <span className="impact-label">Unique Donors Served</span>
        </motion.div>
      </div>

      {/* Simple Bar Chart */}
      <div className="card" style={{ padding: 'var(--space-8)' }}>
        <h3 style={{ marginBottom: 'var(--space-6)' }}>Meals Served — Last 6 Months</h3>
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justify: 'space-between',
          gap: 'var(--space-4)',
          height: '250px',
          padding: 'var(--space-4) 0'
        }}>
          {monthlyData.map((d, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
              <motion.div
                style={{
                  width: '100%',
                  maxWidth: '60px',
                  background: `linear-gradient(180deg, var(--color-earth) 0%, var(--color-ochre) 100%)`,
                  borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                  minHeight: '4px',
                  position: 'relative'
                }}
                initial={{ height: 0 }}
                animate={{ height: `${(d.meals / maxMeals) * 200}px` }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.6, ease: 'easeOut' }}
              >
                <span style={{
                  position: 'absolute',
                  top: '-24px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  color: 'var(--color-bark)',
                  whiteSpace: 'nowrap'
                }}>
                  {d.meals}
                </span>
              </motion.div>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-bark-light)', fontWeight: 500 }}>
                {d.month}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card" style={{ padding: 'var(--space-6)', marginTop: 'var(--space-6)' }}>
        <h3 style={{ marginBottom: 'var(--space-4)' }}>Recent Highlights</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {[
            { icon: '🏆', text: 'Served 1,250 meals this month — your highest yet!', time: '2 days ago' },
            { icon: '🤝', text: 'New donor partnerships: Fresh Basket Store, Rajesh Bakery', time: '5 days ago' },
            { icon: '📦', text: 'Completed 47 pickups in March with 98% success rate', time: '1 week ago' },
            { icon: '🌟', text: 'Earned "Community Champion" badge for consistent service', time: '2 weeks ago' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.3rem' }}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 'var(--text-sm)', lineHeight: 1.5 }}>{item.text}</p>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-bark-light)' }}>{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
