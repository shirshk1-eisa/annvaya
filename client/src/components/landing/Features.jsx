import { motion } from 'framer-motion';

const features = [
  {
    icon: '⚡',
    iconClass: 'earth',
    title: 'Real-Time Matching',
    desc: 'Instant notifications connect surplus food with nearby NGOs. No food sits idle — every second counts when freshness matters.'
  },
  {
    icon: '📍',
    iconClass: 'olive',
    title: 'Smart Geolocation',
    desc: 'Find and connect with donors or NGOs within your radius. Our map shows live availability so you never miss a pickup.'
  },
  {
    icon: '📅',
    iconClass: 'ochre',
    title: 'Flexible Scheduling',
    desc: 'Whether it\'s a quick daily donation or a pre-planned event surplus, schedule pickups at your convenience.'
  },
  {
    icon: '✅',
    iconClass: 'sage',
    title: 'Verified NGO Network',
    desc: 'Every NGO on Annvaya is verified. Trust that your food reaches genuine organizations serving the community.'
  },
  {
    icon: '🎯',
    iconClass: 'earth',
    title: 'NGO Request Board',
    desc: 'NGOs can post specific food needs. Donors see exactly what\'s needed and can fulfill requests directly — reducing waste, meeting demand.'
  },
  {
    icon: '📊',
    iconClass: 'olive',
    title: 'Impact Tracking',
    desc: 'Track every donation, see your impact grow. Badges, streaks, and reports show the real difference you\'re making.'
  }
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function Features() {
  return (
    <section className="features-section section" id="features">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-eyebrow">Why Annvaya?</span>
          <h2 className="section-title">Built for Real Impact</h2>
          <p className="section-desc">
            More than just a platform — Annvaya is a bridge between generosity and need,
            designed to make food sharing effortless.
          </p>
        </motion.div>

        <motion.div
          className="features-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="feature-card card"
              variants={itemVariants}
            >
              <div className={`feature-icon ${feature.iconClass}`}>
                <span>{feature.icon}</span>
              </div>
              <div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
