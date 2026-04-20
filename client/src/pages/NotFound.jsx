import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-cream)',
      textAlign: 'center',
      padding: 'var(--space-8)'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.p
          style={{ fontSize: '6rem', marginBottom: 'var(--space-4)' }}
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          🍽️
        </motion.p>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-5xl)', color: 'var(--color-bark)', marginBottom: 'var(--space-3)' }}>
          404
        </h1>
        <h2 style={{ fontFamily: 'var(--font-accent)', fontSize: 'var(--text-3xl)', color: 'var(--color-earth)', marginBottom: 'var(--space-4)' }}>
          This plate is empty!
        </h2>
        <p style={{ color: 'var(--color-bark-light)', fontSize: 'var(--text-lg)', maxWidth: '500px', margin: '0 auto var(--space-8)', lineHeight: 1.7 }}>
          Looks like the page you're looking for doesn't exist.
          But don't worry — there's plenty of good food to share elsewhere!
        </p>
        <Link to="/" className="btn btn-primary btn-lg">
          🏠 Back to Home
        </Link>
      </motion.div>
    </div>
  );
}
