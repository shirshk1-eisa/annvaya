import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit2, FiSave, FiX } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../utils/api';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.location?.address || '',
    // NGO-specific
    organizationName: user?.ngoDetails?.organizationName || '',
    missionStatement: user?.ngoDetails?.missionStatement || '',
    registrationNumber: user?.ngoDetails?.registrationNumber || '',
  });

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const updates = {
        name: formData.name,
        phone: formData.phone,
        location: { address: formData.address },
      };

      if (user?.role === 'ngo') {
        updates.ngoDetails = {
          organizationName: formData.organizationName,
          missionStatement: formData.missionStatement,
          registrationNumber: formData.registrationNumber,
        };
      }

      const data = await authAPI.updateProfile(updates);
      updateUser(data.user);
      setEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      address: user?.location?.address || '',
      organizationName: user?.ngoDetails?.organizationName || '',
      missionStatement: user?.ngoDetails?.missionStatement || '',
      registrationNumber: user?.ngoDetails?.registrationNumber || '',
    });
    setError('');
  };

  const isNgo = user?.role === 'ngo';
  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        <h2><FiUser style={{ verticalAlign: 'middle', marginRight: '8px' }} />My Profile</h2>
        {!editing ? (
          <button className="btn btn-sm btn-primary" onClick={() => setEditing(true)}>
            <FiEdit2 size={14} /> Edit Profile
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button className="btn btn-sm btn-ghost" onClick={handleCancel}>
              <FiX size={14} /> Cancel
            </button>
            <button className="btn btn-sm btn-primary" onClick={handleSave} disabled={saving}>
              <FiSave size={14} /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {success && (
        <div style={{
          padding: 'var(--space-3) var(--space-4)',
          background: 'rgba(107, 127, 59, 0.1)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-olive)',
          fontSize: 'var(--text-sm)',
          marginBottom: 'var(--space-4)',
        }}>
          ✅ {success}
        </div>
      )}

      {error && (
        <div style={{
          padding: 'var(--space-3) var(--space-4)',
          background: 'rgba(114, 47, 55, 0.08)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-wine)',
          fontSize: 'var(--text-sm)',
          marginBottom: 'var(--space-4)',
        }}>
          {error}
        </div>
      )}

      {/* Profile Card */}
      <div className="card" style={{ padding: 'var(--space-8)' }}>
        {/* Avatar + basic info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)', marginBottom: 'var(--space-8)', flexWrap: 'wrap' }}>
          <div style={{
            width: '80px', height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--color-olive), var(--color-ochre))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: 'var(--text-xl)', fontWeight: 700,
            fontFamily: 'var(--font-heading)',
            flexShrink: 0,
          }}>
            {initials}
          </div>
          <div>
            <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-1)' }}>
              {user?.name || 'User'}
            </h3>
            <p style={{ color: 'var(--color-bark-light)', fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
              <FiMail size={13} /> {user?.email}
            </p>
            <span className={`badge ${isNgo ? 'badge-olive' : 'badge-ochre'}`} style={{ marginTop: 'var(--space-2)', display: 'inline-block' }}>
              {isNgo ? '🏢 NGO' : '🤲 Donor'}
            </span>
          </div>
        </div>

        {/* Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
          {/* Name */}
          <div>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-bark-light)', marginBottom: 'var(--space-2)', display: 'block' }}>
              <FiUser size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Full Name
            </label>
            {editing ? (
              <input
                type="text" className="form-input"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                style={{ fontSize: 'var(--text-sm)' }}
              />
            ) : (
              <p style={{ fontSize: 'var(--text-base)', fontWeight: 500, padding: 'var(--space-2) 0' }}>
                {user?.name || '—'}
              </p>
            )}
          </div>

          {/* Email (read-only) */}
          <div>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-bark-light)', marginBottom: 'var(--space-2)', display: 'block' }}>
              <FiMail size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Email Address
            </label>
            <p style={{ fontSize: 'var(--text-base)', fontWeight: 500, padding: 'var(--space-2) 0', color: 'var(--color-bark)' }}>
              {user?.email || '—'}
            </p>
          </div>

          {/* Phone */}
          <div>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-bark-light)', marginBottom: 'var(--space-2)', display: 'block' }}>
              <FiPhone size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Phone Number
            </label>
            {editing ? (
              <input
                type="tel" className="form-input"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                style={{ fontSize: 'var(--text-sm)' }}
              />
            ) : (
              <p style={{ fontSize: 'var(--text-base)', fontWeight: 500, padding: 'var(--space-2) 0' }}>
                {user?.phone || 'Not set'}
              </p>
            )}
          </div>

          {/* Address */}
          <div>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-bark-light)', marginBottom: 'var(--space-2)', display: 'block' }}>
              <FiMapPin size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Address
            </label>
            {editing ? (
              <input
                type="text" className="form-input"
                placeholder="Enter address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                style={{ fontSize: 'var(--text-sm)' }}
              />
            ) : (
              <p style={{ fontSize: 'var(--text-base)', fontWeight: 500, padding: 'var(--space-2) 0' }}>
                {user?.location?.address || 'Not set'}
              </p>
            )}
          </div>
        </div>

        {/* NGO-specific fields */}
        {isNgo && (
          <>
            <hr style={{ margin: 'var(--space-6) 0', border: 'none', borderTop: '1px solid var(--color-sand)' }} />
            <h4 style={{ marginBottom: 'var(--space-4)', fontFamily: 'var(--font-heading)' }}>
              🏢 Organization Details
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
              <div>
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-bark-light)', marginBottom: 'var(--space-2)', display: 'block' }}>
                  Organization Name
                </label>
                {editing ? (
                  <input
                    type="text" className="form-input"
                    value={formData.organizationName}
                    onChange={(e) => setFormData(prev => ({ ...prev, organizationName: e.target.value }))}
                    style={{ fontSize: 'var(--text-sm)' }}
                  />
                ) : (
                  <p style={{ fontSize: 'var(--text-base)', fontWeight: 500, padding: 'var(--space-2) 0' }}>
                    {user?.ngoDetails?.organizationName || '—'}
                  </p>
                )}
              </div>

              <div>
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-bark-light)', marginBottom: 'var(--space-2)', display: 'block' }}>
                  Registration Number
                </label>
                {editing ? (
                  <input
                    type="text" className="form-input"
                    placeholder="e.g. NGO/2024/12345"
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, registrationNumber: e.target.value }))}
                    style={{ fontSize: 'var(--text-sm)' }}
                  />
                ) : (
                  <p style={{ fontSize: 'var(--text-base)', fontWeight: 500, padding: 'var(--space-2) 0' }}>
                    {user?.ngoDetails?.registrationNumber || 'Not set'}
                  </p>
                )}
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-bark-light)', marginBottom: 'var(--space-2)', display: 'block' }}>
                  Mission Statement
                </label>
                {editing ? (
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Your organization's mission"
                    value={formData.missionStatement}
                    onChange={(e) => setFormData(prev => ({ ...prev, missionStatement: e.target.value }))}
                    style={{ fontSize: 'var(--text-sm)' }}
                  />
                ) : (
                  <p style={{ fontSize: 'var(--text-base)', fontWeight: 500, padding: 'var(--space-2) 0', lineHeight: 1.6 }}>
                    {user?.ngoDetails?.missionStatement || 'Not set'}
                  </p>
                )}
              </div>

              <div>
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-bark-light)', marginBottom: 'var(--space-2)', display: 'block' }}>
                  Verification Status
                </label>
                <p style={{ fontSize: 'var(--text-base)', fontWeight: 500, padding: 'var(--space-2) 0' }}>
                  {user?.ngoDetails?.verified ? '✅ Verified' : '⏳ Pending Verification'}
                </p>
              </div>
            </div>
          </>
        )}

        {/* Account Info */}
        <hr style={{ margin: 'var(--space-6) 0', border: 'none', borderTop: '1px solid var(--color-sand)' }} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-6)', fontSize: 'var(--text-sm)', color: 'var(--color-bark-light)' }}>
          <div>
            <span style={{ fontWeight: 600 }}>Role: </span>
            {user?.role === 'ngo' ? 'NGO' : 'Donor'}
          </div>
          <div>
            <span style={{ fontWeight: 600 }}>Member since: </span>
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
