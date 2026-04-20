import { motion } from 'framer-motion';

const steps = [
  {
    icon: '📸',
    title: 'List Your Surplus',
    desc: 'Snap a photo, add details about your food (type, quantity, best before), and set a pickup window. Takes less than 60 seconds.',
    className: 'step-1'
  },
  {
    icon: '🤝',
    title: 'NGOs Accept & Pickup',
    desc: 'Nearby verified NGOs get notified instantly. They accept the donation and schedule a pickup at your convenience.',
    className: 'step-2'
  },
  {
    icon: '💛',
    title: 'Feed The Hungry',
    desc: 'Your surplus food reaches those who need it most. Track your impact — every meal shared builds a better community.',
    className: 'step-3'
  }
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' }
  }
};

export default function HowItWorks() {
  return (
    <section className="how-it-works section" id="how-it-works">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-eyebrow">Simple & Quick</span>
          <h2 className="section-title">How Annvaya Works</h2>
          <p className="section-desc">
            Three simple steps to turn your surplus food into someone's cherished meal.
            No food should go to waste when someone is hungry.
          </p>
        </motion.div>

        <motion.div
          className="steps-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className={`step-card ${step.className}`}
              variants={itemVariants}
            >
              <div className="step-icon-wrapper">
                <span style={{ fontSize: '2.5rem' }}>{step.icon}</span>
                <span className="step-number">{index + 1}</span>
              </div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-desc">{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
