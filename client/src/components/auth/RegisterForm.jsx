import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';
import logoImg from '../../assets/images/logo.png';

export default function RegisterForm() {
  const [role, setRole] = useState('donor');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    organizationName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    const result = await register({ ...formData, role });
    setLoading(false);

    if (result.success) {
      navigate(role === 'ngo' ? '/ngo' : '/donor');
    } else {
      setError(result.error || 'Registration failed');
    }
  };

  return (
    <div className="auth-form-container">
      <Link to="/" className="auth-logo">
        <img src={logoImg} alt="" className="auth-logo-img" />
        Annvaya
      </Link>
      <h2 className="auth-form-title">Join the Movement</h2>
      <p className="auth-form-subtitle">
        Create an account to start sharing food or receiving donations
      </p>

      {error && (
        <div style={{
          padding: 'var(--space-3) var(--space-4)',
          background: 'rgba(114, 47, 55, 0.08)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-wine)',
          fontSize: 'var(--text-sm)',
          marginBottom: 'var(--space-4)',
          border: '1px solid rgba(114, 47, 55, 0.15)'
        }}>
          {error}
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit} id="register-form">
        {/* Role Selector */}
        <div className="form-group">
          <label className="form-label">I want to</label>
          <div className="role-selector">
            <button
              type="button"
              className={`role-option ${role === 'donor' ? 'active' : ''}`}
              onClick={() => setRole('donor')}
              id="role-donor"
            >
              <span className="role-option-icon">🍽️</span>
              <span className="role-option-label">Donate Food</span>
              <span className="role-option-desc">Share surplus meals</span>
            </button>
            <button
              type="button"
              className={`role-option ${role === 'ngo' ? 'active' : ''}`}
              onClick={() => setRole('ngo')}
              id="role-ngo"
            >
              <span className="role-option-icon">🏛️</span>
              <span className="role-option-label">Receive as NGO</span>
              <span className="role-option-desc">Collect & distribute</span>
            </button>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">
              {role === 'ngo' ? 'Contact Person Name' : 'Full Name'}
            </label>
            <div className="input-wrapper">
              <FiUser className="input-icon" />
              <input
                type="text"
                id="reg-name"
                name="name"
                className="form-input with-icon"
                placeholder="Your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-phone">Phone</label>
            <div className="input-wrapper">
              <FiPhone className="input-icon" />
              <input
                type="tel"
                id="reg-phone"
                name="phone"
                className="form-input with-icon"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {role === 'ngo' && (
          <div className="form-group">
            <label className="form-label" htmlFor="reg-org">Organization Name</label>
            <input
              type="text"
              id="reg-org"
              name="organizationName"
              className="form-input"
              placeholder="e.g., Annapurna Foundation"
              value={formData.organizationName}
              onChange={handleChange}
              required
            />
          </div>
        )}

        <div className="form-group">
          <label className="form-label" htmlFor="reg-email">Email Address</label>
          <div className="input-wrapper">
            <FiMail className="input-icon" />
            <input
              type="email"
              id="reg-email"
              name="email"
              className="form-input with-icon"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <div className="input-wrapper">
              <FiLock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="reg-password"
                name="password"
                className="form-input with-icon"
                placeholder="Min 8 characters"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
            <div className="input-wrapper">
              <FiLock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="reg-confirm"
                name="confirmPassword"
                className="form-input with-icon"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        <label className="checkbox-label">
          <input type="checkbox" required />
          I agree to the <a href="#" style={{ color: 'var(--color-earth)', fontWeight: 500 }}>Terms of Service</a> and <a href="#" style={{ color: 'var(--color-earth)', fontWeight: 500 }}>Privacy Policy</a>
        </label>

        <button
          type="submit"
          className="btn btn-primary auth-submit"
          disabled={loading}
          id="register-submit"
        >
          {loading ? 'Creating Account...' : `Register as ${role === 'ngo' ? 'NGO' : 'Donor'}`}
        </button>
      </form>

      <p className="auth-switch">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
}
