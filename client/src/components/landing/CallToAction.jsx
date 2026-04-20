import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function CallToAction() {
  return (
    <section className="cta-section section" id="cta">
      <div className="container">
        <motion.div
          className="cta-card"
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <p style={{
              fontFamily: 'var(--font-accent)',
              fontSize: 'var(--text-2xl)',
              color: 'var(--color-ochre-light)',
              marginBottom: 'var(--space-3)'
            }}>
              Be the change today
            </p>
          </motion.div>

          <h2 className="cta-title">
            Every Meal Shared is a Life Touched
          </h2>
          <p className="cta-desc">
            Whether you're a home cook with extra chapatis, a restaurant with end-of-day surplus,
            or an event organizer with leftover feast — your food can feed someone tonight.
            Join thousands of donors and NGOs already making a difference.
          </p>

          <div className="cta-actions">
            <Link to="/register" className="btn-white" id="cta-start-btn">
              🌾 Start Sharing Food
            </Link>
            <Link to="/register" className="btn-outline-white" id="cta-ngo-btn">
              🏛️ Join as NGO Partner
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
