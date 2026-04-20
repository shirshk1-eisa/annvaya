import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCamera, FiMapPin, FiClock, FiCheck, FiArrowLeft, FiArrowRight, FiPhone, FiTruck, FiNavigation } from 'react-icons/fi';
import { donationsAPI } from '../../utils/api';
import chipsIcon from '../../assets/images/food-icons/chips_packet.png';

const FOOD_TYPES = [
  { id: 'cooked', icon: '🍛', label: 'Cooked Food' },
  { id: 'raw', icon: '🥬', label: 'Raw / Groceries' },
  { id: 'packaged', icon: null, img: chipsIcon, label: 'Packaged' },
  { id: 'beverages', icon: '🥤', label: 'Beverages' },
  { id: 'mixed', icon: '🍱🥤🍫', label: 'Mixed' },
];

const DIETARY_OPTIONS = ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Gluten-Free'];

export default function QuickDonateForm() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    foodType: '',
    title: '',
    description: '',
    quantity: '',
    dietaryInfo: [],
    bestBefore: '',
    deliveryMode: 'pickup',
    address: '',
    pickupStart: '',
    pickupEnd: '',
    phone: '',
  });

  const handleDietaryToggle = (diet) => {
    const current = formData.dietaryInfo;
    if (current.includes(diet)) {
      setFormData({ ...formData, dietaryInfo: current.filter(d => d !== diet) });
    } else {
      setFormData({ ...formData, dietaryInfo: [...current, diet] });
    }
  };

  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async () => {
    try {
      setSubmitError('');
      await donationsAPI.create({
        foodType: formData.foodType,
        title: formData.title,
        description: formData.description,
        quantity: formData.quantity,
        dietaryInfo: formData.dietaryInfo,
        bestBefore: formData.bestBefore || undefined,
        deliveryMode: formData.deliveryMode,
        address: formData.address,
        pickupStart: formData.pickupStart || undefined,
        pickupEnd: formData.pickupEnd || undefined,
        phone: formData.phone,
      });
      setSubmitted(true);
    } catch (error) {
      setSubmitError(error.message);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: 'center', padding: 'var(--space-16) var(--space-8)' }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          style={{ fontSize: '5rem', marginBottom: 'var(--space-6)' }}
        >
          🎉
        </motion.div>
        <h2 style={{ marginBottom: 'var(--space-4)' }}>Thank You for Your Generosity!</h2>
        <p style={{ color: 'var(--color-bark-light)', fontSize: 'var(--text-lg)', maxWidth: '500px', margin: '0 auto var(--space-6)' }}>
          Your donation has been listed. Nearby NGOs will be notified instantly.
          You'll receive updates as someone accepts and schedules a pickup!
        </p>
        <p style={{ fontFamily: 'var(--font-accent)', fontSize: 'var(--text-2xl)', color: 'var(--color-earth)' }}>
          "No act of kindness, no matter how small, is ever wasted."
        </p>
        <button
          className="btn btn-primary"
          style={{ marginTop: 'var(--space-8)' }}
          onClick={() => { setSubmitted(false); setStep(1); setFormData({ foodType: '', title: '', description: '', quantity: '', dietaryInfo: [], bestBefore: '', deliveryMode: 'pickup', address: '', pickupStart: '', pickupEnd: '', phone: '' }); }}
        >
          Donate Again
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 style={{ marginBottom: 'var(--space-2)' }}>Donate Food</h2>
      <p style={{ color: 'var(--color-bark-light)', marginBottom: 'var(--space-6)' }}>
        List your surplus food in just a few steps. Nearby NGOs will be notified instantly.
      </p>

      {/* Progress Steps */}
      <div className="form-steps">
        {[1, 2, 3].map((s, i) => (
          <div key={s} className="form-step">
            <div className={`form-step-dot ${step === s ? 'active' : step > s ? 'completed' : 'inactive'}`}>
              {step > s ? <FiCheck size={14} /> : s}
            </div>
            <span className={`form-step-label ${step === s ? 'active' : ''}`}>
              {s === 1 ? 'Food Type' : s === 2 ? 'Details' : 'Pickup'}
            </span>
            {i < 2 && <div className={`form-step-line ${step > s ? 'completed' : ''}`} />}
          </div>
        ))}
      </div>

      <div className="donate-form-wrapper">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h3 style={{ marginBottom: 'var(--space-4)' }}>What type of food are you donating?</h3>
              <div className="food-type-grid">
                {FOOD_TYPES.map((type) => (
                  <button
                    key={type.id}
                    className={`food-type-option ${formData.foodType === type.id ? 'selected' : ''}`}
                    onClick={() => setFormData({ ...formData, foodType: type.id })}
                    id={`food-type-${type.id}`}
                  >
                    <span className="food-type-icon">
                      {type.img ? <img src={type.img} alt={type.label} style={{ width: '2.2em', height: '2.2em', objectFit: 'contain', mixBlendMode: 'multiply' }} /> : type.icon}
                    </span>
                    <span className="food-type-label">{type.label}</span>
                  </button>
                ))}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="donation-title">Give it a title</label>
                <input
                  type="text"
                  id="donation-title"
                  className="form-input"
                  placeholder="e.g., Biryani from family dinner"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-6)' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => setStep(2)}
                  disabled={!formData.foodType || !formData.title}
                >
                  Next <FiArrowRight />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h3 style={{ marginBottom: 'var(--space-4)' }}>Tell us more about the food</h3>

              <div className="form-group">
                <label className="form-label" htmlFor="donation-desc">Description</label>
                <textarea
                  id="donation-desc"
                  className="form-textarea"
                  placeholder="Describe the food, how it was prepared, any allergens, etc."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div>
                  <label className="form-label" htmlFor="donation-qty">Quantity</label>
                  <input
                    type="text"
                    id="donation-qty"
                    className="form-input"
                    placeholder="e.g., 20 meals, 5 kg"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label" htmlFor="donation-bestbefore">Best Before</label>
                  <input
                    type="datetime-local"
                    id="donation-bestbefore"
                    className="form-input"
                    value={formData.bestBefore}
                    onChange={(e) => setFormData({ ...formData, bestBefore: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Dietary Information</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  {DIETARY_OPTIONS.map((diet) => (
                    <button
                      key={diet}
                      type="button"
                      className={`map-filter-chip ${formData.dietaryInfo.includes(diet) ? 'active' : ''}`}
                      onClick={() => handleDietaryToggle(diet)}
                    >
                      {diet}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Photos (optional)</label>
                <div className="photo-upload">
                  <div className="photo-upload-icon"><FiCamera /></div>
                  <p className="photo-upload-text">
                    <strong>Click to upload</strong> or drag & drop<br />
                    PNG, JPG up to 5MB
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-6)' }}>
                <button className="btn btn-ghost" onClick={() => setStep(1)}>
                  <FiArrowLeft /> Back
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => setStep(3)}
                  disabled={!formData.quantity}
                >
                  Next <FiArrowRight />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h3 style={{ marginBottom: 'var(--space-4)' }}>How would you like to hand over?</h3>

              {/* Delivery Mode Toggle */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
                <button
                  type="button"
                  className={`food-type-option ${formData.deliveryMode === 'pickup' ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, deliveryMode: 'pickup' })}
                  style={{ minHeight: '80px' }}
                  id="mode-pickup"
                >
                  <span className="food-type-icon" style={{ fontSize: '1.5rem', height: 'auto' }}><FiTruck /></span>
                  <span className="food-type-label">Schedule Pickup</span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-bark-light)' }}>NGO picks up from you</span>
                </button>
                <button
                  type="button"
                  className={`food-type-option ${formData.deliveryMode === 'self' ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, deliveryMode: 'self' })}
                  style={{ minHeight: '80px' }}
                  id="mode-self-deliver"
                >
                  <span className="food-type-icon" style={{ fontSize: '1.5rem', height: 'auto' }}><FiNavigation /></span>
                  <span className="food-type-label">I'll Deliver Myself</span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-bark-light)' }}>Drop off at the NGO</span>
                </button>
              </div>

              {formData.deliveryMode === 'pickup' ? (
                <>
                  <div className="form-group">
                    <label className="form-label" htmlFor="donation-address">
                      <FiMapPin style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                      Pickup Address
                    </label>
                    <input
                      type="text"
                      id="donation-address"
                      className="form-input"
                      placeholder="Full address for pickup"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      style={{ marginTop: 'var(--space-2)' }}
                    >
                      📍 Use My Current Location
                    </button>
                  </div>

                  <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                    <div>
                      <label className="form-label" htmlFor="pickup-start">
                        <FiClock style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                        Pickup Window Start
                      </label>
                      <input
                        type="datetime-local"
                        id="pickup-start"
                        className="form-input"
                        value={formData.pickupStart}
                        onChange={(e) => setFormData({ ...formData, pickupStart: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="form-label" htmlFor="pickup-end">Pickup Window End</label>
                      <input
                        type="datetime-local"
                        id="pickup-end"
                        className="form-input"
                        value={formData.pickupEnd}
                        onChange={(e) => setFormData({ ...formData, pickupEnd: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label className="form-label" htmlFor="donor-phone">
                      <FiPhone style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                      Your Phone Number
                    </label>
                    <input
                      type="tel"
                      id="donor-phone"
                      className="form-input"
                      placeholder="e.g., +91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-bark-light)', marginTop: 'var(--space-2)' }}>
                      The NGO will share their drop-off address and coordinate with you via this number.
                    </p>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="self-deliver-time">
                      <FiClock style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                      Preferred Drop-off Time
                    </label>
                    <input
                      type="datetime-local"
                      id="self-deliver-time"
                      className="form-input"
                      value={formData.pickupStart}
                      onChange={(e) => setFormData({ ...formData, pickupStart: e.target.value })}
                    />
                  </div>
                </>
              )}

              {/* Summary */}
              <div className="card card-flat" style={{ marginTop: 'var(--space-6)' }}>
                <h4 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--text-base)' }}>📋 Donation Summary</h4>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-bark-light)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <p><strong>Type:</strong> {FOOD_TYPES.find(t => t.id === formData.foodType)?.label}</p>
                  <p><strong>Title:</strong> {formData.title}</p>
                  <p><strong>Quantity:</strong> {formData.quantity}</p>
                  {formData.dietaryInfo.length > 0 && (
                    <p><strong>Dietary:</strong> {formData.dietaryInfo.join(', ')}</p>
                  )}
                  <p><strong>Handover:</strong> {formData.deliveryMode === 'pickup' ? '🚚 NGO Pickup' : '🚗 Self Delivery'}</p>
                  {formData.deliveryMode === 'pickup' && formData.address && <p><strong>Address:</strong> {formData.address}</p>}
                  {formData.deliveryMode === 'self' && formData.phone && <p><strong>Phone:</strong> {formData.phone}</p>}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-6)' }}>
                <button className="btn btn-ghost" onClick={() => setStep(2)}>
                  <FiArrowLeft /> Back
                </button>
                <button className="btn btn-primary btn-lg" onClick={handleSubmit} id="submit-donation">
                  🍽️ List Donation
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
