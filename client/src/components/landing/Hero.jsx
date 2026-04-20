import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import heroBg from '../../assets/images/hero_bg.png';

export default function Hero() {
  return (
    <section
      className="hero"
      id="hero"
      style={{ backgroundImage: `url(${heroBg})` }}
    >
      {/* Dark overlay for readability */}
      <div className="hero-overlay"></div>

      {/* Canvas grain texture */}
      <div className="hero-grain"></div>

      <div className="hero-inner">
        <motion.div
          className="hero-content-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        >
          <h1 className="hero-title-center">
            Share Food{' '}
            <span className="hero-highlight">Share Life</span>
          </h1>

          <p className="hero-tagline">Zero Waste, Full Hearts</p>

          <p className="hero-subtitle-center">
            Annvaya connects surplus food from homes, restaurants, and events with
            NGOs who serve the most vulnerable. Every meal you save is a life you touch.
          </p>

          <motion.div
            className="hero-actions-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Link to="/register" className="hero-btn-primary" id="hero-donate-btn">
              🍽️ Donate Food Now
            </Link>
            <Link to="/register" className="hero-btn-outline" id="hero-ngo-btn">
              🏛️ Register as NGO
            </Link>
          </motion.div>

          <motion.div
            className="hero-stats-bar"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <div className="hero-stat-item">
              <span className="hero-stat-num">12,450+</span>
              <span className="hero-stat-lbl">Meals Shared</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat-item">
              <span className="hero-stat-num">85+</span>
              <span className="hero-stat-lbl">NGO Partners</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat-item">
              <span className="hero-stat-num">3,200+</span>
              <span className="hero-stat-lbl">Active Donors</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll hint */}
      <motion.div
        className="hero-scroll-hint"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span>↓</span>
      </motion.div>
    </section>
  );
}
