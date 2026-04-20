import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const stats = [
  { icon: '🍽️', target: 12450, label: 'Meals Shared', suffix: '+' },
  { icon: '🏛️', target: 85, label: 'NGO Partners', suffix: '+' },
  { icon: '♻️', target: 4800, label: 'Kg Food Saved', suffix: '+' },
  { icon: '🤲', target: 3200, label: 'Active Donors', suffix: '+' },
];

function AnimatedCounter({ target, suffix = '', inView }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;

    let startTime;
    const duration = 2000;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [inView, target]);

  return (
    <span className="impact-number">
      {count.toLocaleString('en-IN')}{suffix}
    </span>
  );
}

export default function ImpactCounter() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="impact-section section" id="impact" ref={ref}>
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: 'var(--space-12)' }}
        >
          <span className="section-eyebrow" style={{ color: 'var(--color-ochre-light)' }}>
            Our Impact So Far
          </span>
          <h2 className="section-title" style={{ color: 'white' }}>
            Every Number Tells a Story
          </h2>
          <p className="section-desc" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Together, we're building a movement. These aren't just numbers — they represent
            real meals, real people, and real change.
          </p>
        </motion.div>

        <div className="impact-grid">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="impact-item"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
            >
              <span className="impact-icon">{stat.icon}</span>
              <AnimatedCounter target={stat.target} suffix={stat.suffix} inView={inView} />
              <span className="impact-label">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
