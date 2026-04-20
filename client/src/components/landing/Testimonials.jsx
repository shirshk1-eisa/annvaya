import { motion } from 'framer-motion';

const testimonials = [
  {
    text: "Annvaya made it incredibly easy for us to donate leftover food from our restaurant every night. What used to go to waste now feeds families. The pickup scheduling is seamless — a volunteer arrives exactly when we need them.",
    name: 'Deepak Kulkarni',
    role: 'Restaurant Owner, Bengaluru',
    initial: 'D'
  },
  {
    text: "As a small NGO, finding consistent food donations was always a challenge. With Annvaya's request board, we can now post exactly what we need and donors step up. Our kitchen hasn't run short in 3 months!",
    name: 'Sunita Devi',
    role: 'Director, Annapurna Foundation',
    initial: 'S'
  },
  {
    text: "After my daughter's wedding, we had food for 100 people going unused. Through Annvaya, within an hour, two NGOs picked it up and served it to communities that night. Now I use it every time we have guests over!",
    name: 'Meera Joshi',
    role: 'Regular Donor, Pune',
    initial: 'M'
  }
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

export default function Testimonials() {
  return (
    <section className="testimonials section" id="testimonials">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-eyebrow">Voices of Change</span>
          <h2 className="section-title">Stories from Our Community</h2>
          <p className="section-desc">
            Real people, real impact. Here's what our donors and NGO partners say about
            their Annvaya experience.
          </p>
        </motion.div>

        <motion.div
          className="testimonials-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {testimonials.map((t, index) => (
            <motion.div
              key={index}
              className="testimonial-card card"
              variants={itemVariants}
            >
              <span className="testimonial-quote-icon">"</span>
              <p className="testimonial-text">{t.text}</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{t.initial}</div>
                <div>
                  <div className="testimonial-name">{t.name}</div>
                  <div className="testimonial-role">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
