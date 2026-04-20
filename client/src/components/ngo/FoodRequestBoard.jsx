import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiX, FiClock, FiAlertTriangle } from 'react-icons/fi';
import { getTimeUntil } from '../../utils/mockData';
import { foodRequestsAPI } from '../../utils/api';

export default function FoodRequestBoard({ requests: initialRequests, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [items, setItems] = useState([{ item: '', quantity: '', urgency: 'medium' }]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [historyRequests, setHistoryRequests] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Fetch history when toggled
  useEffect(() => {
    if (showHistory) {
      setHistoryLoading(true);
      foodRequestsAPI.getMy(true)
        .then(data => setHistoryRequests(data.requests || []))
        .catch(err => console.error('Failed to load history:', err))
        .finally(() => setHistoryLoading(false));
    }
  }, [showHistory]);

  const requests = showHistory ? historyRequests : (initialRequests || []);

  const addItem = () => {
    setItems([...items, { item: '', quantity: '', urgency: 'medium' }]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleSubmitRequest = async () => {
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }
    if (items.some(i => !i.item.trim() || !i.quantity.trim())) {
      setError('Please fill in all item fields');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await foodRequestsAPI.create({
        title,
        description,
        itemsNeeded: items,
        deadline: deadline || undefined,
      });
      setTitle('');
      setDescription('');
      setItems([{ item: '', quantity: '', urgency: 'medium' }]);
      setDeadline('');
      setShowForm(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkFulfilled = async (requestId) => {
    try {
      await foodRequestsAPI.updateStatus(requestId, 'fulfilled');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to mark fulfilled:', err);
    }
  };

  const handleCloseRequest = async (requestId) => {
    try {
      await foodRequestsAPI.updateStatus(requestId, 'closed');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to close request:', err);
    }
  };

  const urgencyColors = {
    low: 'badge-olive',
    medium: 'badge-ochre',
    high: 'badge-earth',
    critical: 'badge-wine'
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h2 style={{ marginBottom: 'var(--space-2)' }}>Food Request Board</h2>
          <p style={{ color: 'var(--color-bark-light)' }}>
            {showHistory
              ? 'Previously fulfilled and closed requests'
              : 'Post specific food items your organization needs. Donors can see and fulfill your requests directly.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          <button
            className={`btn btn-sm ${!showHistory ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setShowHistory(false)}
          >
            Active
          </button>
          <button
            className={`btn btn-sm ${showHistory ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setShowHistory(true)}
          >
            📜 History
          </button>
          {!showHistory && (
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)} id="new-request-btn">
              <FiPlus /> New Request
            </button>
          )}
        </div>
      </div>

      {/* New Request Form */}
      {showForm && !showHistory && (
        <motion.div
          className="request-form-card card"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          style={{ marginBottom: 'var(--space-8)' }}
        >
          <h3 style={{ marginBottom: 'var(--space-4)' }}>📋 New Food Request</h3>

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

          <div className="form-group">
            <label className="form-label" htmlFor="req-title">Request Title</label>
            <input
              type="text"
              id="req-title"
              className="form-input"
              placeholder="e.g., Weekly Ration for 200 Children"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="req-desc">Description</label>
            <textarea
              id="req-desc"
              className="form-textarea"
              placeholder="Describe why you need these items and how they'll be used"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Items Needed</label>
            <div className="request-items-list">
              {items.map((item, i) => (
                <div key={i} className="request-item-row">
                  <input
                    className="form-input"
                    placeholder="Item name"
                    value={item.item}
                    onChange={(e) => updateItem(i, 'item', e.target.value)}
                  />
                  <input
                    className="form-input"
                    placeholder="Quantity"
                    value={item.quantity}
                    onChange={(e) => updateItem(i, 'quantity', e.target.value)}
                  />
                  <select
                    className="form-select"
                    value={item.urgency}
                    onChange={(e) => updateItem(i, 'urgency', e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                  <button className="request-item-remove" onClick={() => removeItem(i)} disabled={items.length === 1}>
                    <FiX size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button className="add-item-btn" onClick={addItem} type="button">
              <FiPlus size={14} /> Add another item
            </button>
          </div>

          <div className="form-group" style={{ maxWidth: '300px' }}>
            <label className="form-label" htmlFor="req-deadline">
              <FiClock style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              Deadline
            </label>
            <input
              type="date"
              id="req-deadline"
              className="form-input"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            <button
              className="btn btn-primary"
              onClick={handleSubmitRequest}
              disabled={submitting}
              id="submit-request"
            >
              {submitting ? 'Posting...' : 'Post Request'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Requests List */}
      <div className="request-board">
        {historyLoading && showHistory ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--color-bark-light)' }}>
            <p>Loading history...</p>
          </div>
        ) : requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--color-bark-light)' }}>
            <p style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>{showHistory ? '📜' : '📋'}</p>
            <h3>{showHistory ? 'No history yet' : 'No requests yet'}</h3>
            <p>{showHistory ? 'Fulfilled and closed requests will appear here' : 'Post your first food request to get started!'}</p>
          </div>
        ) : (
          requests.map((req, index) => {
            const ngoName = req.ngo?.ngoDetails?.organizationName || req.ngo?.name || 'Your Organization';

            // Parse contributed quantities from fulfilledBy entries
            const contributedMap = {};
            for (const entry of (req.fulfilledBy || [])) {
              const parts = (entry.items || '').split(',');
              for (const part of parts) {
                const match = part.trim().match(/^(.+?)\s*[—\-]\s*(\d+)/);
                if (match) {
                  const itemName = match[1].trim().toLowerCase();
                  const qty = parseInt(match[2]) || 0;
                  contributedMap[itemName] = (contributedMap[itemName] || 0) + qty;
                }
              }
            }

            // Calculate real progress
            let totalNeeded = 0;
            let totalContributed = 0;
            for (const item of (req.itemsNeeded || [])) {
              const neededQty = parseInt(item.quantity) || 0;
              const contributed = contributedMap[item.item.trim().toLowerCase()] || 0;
              totalNeeded += neededQty;
              totalContributed += Math.min(contributed, neededQty);
            }
            const progressPercent = totalNeeded > 0 ? Math.min((totalContributed / totalNeeded) * 100, 100) : 0;
            const isFulfilled = req.status === 'fulfilled' || progressPercent >= 100;

            return (
              <motion.div
                key={req._id}
                className="request-card card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <div className="request-urgency">
                  {req.itemsNeeded?.some(i => i.urgency === 'critical') && (
                    <span className="badge badge-wine">
                      <FiAlertTriangle size={12} /> Urgent
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-bark-light)' }}>
                    {ngoName}
                  </span>
                  <span className={`badge ${req.status === 'open' ? 'badge-olive' : req.status === 'partially_fulfilled' ? 'badge-ochre' : req.status === 'fulfilled' ? 'badge-sage' : 'badge-earth'}`}>
                    {(req.status || 'open').replace('_', ' ')}
                  </span>
                </div>

                <h3 className="request-title">{req.title}</h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-bark-light)', marginBottom: 'var(--space-4)', lineHeight: 1.6 }}>
                  {req.description}
                </p>

                {/* Items with per-item progress */}
                <div style={{
                  background: 'var(--color-sand-light)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-3) var(--space-4)',
                  marginBottom: 'var(--space-4)',
                }}>
                  {(req.itemsNeeded || []).map((item, i) => {
                    const neededQty = parseInt(item.quantity) || 0;
                    const itemContributed = contributedMap[item.item.trim().toLowerCase()] || 0;
                    const itemPercent = neededQty > 0 ? Math.min((itemContributed / neededQty) * 100, 100) : 0;
                    const itemDone = itemPercent >= 100;
                    return (
                      <div key={i} style={{
                        padding: 'var(--space-2) 0',
                        borderBottom: i < (req.itemsNeeded.length - 1) ? '1px solid var(--color-sand)' : 'none'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className={`badge ${urgencyColors[item.urgency]}`} style={{ padding: 'var(--space-1) var(--space-3)' }}>
                            {item.item} — {item.quantity}
                          </span>
                          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: itemDone ? 'var(--color-olive)' : 'var(--color-bark-light)' }}>
                            {itemContributed > 0 ? `${itemContributed} / ${neededQty}` : ''}
                            {itemDone && ' ✅'}
                          </span>
                        </div>
                        {itemContributed > 0 && (
                          <div style={{ height: '4px', background: 'var(--color-sand)', borderRadius: '2px', marginTop: 'var(--space-1)', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${itemPercent}%`, background: itemDone ? 'var(--color-olive)' : 'var(--color-ochre)', borderRadius: '2px', transition: 'width 0.4s ease' }}></div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Overall progress bar */}
                <div className="request-progress">
                  <div className="progress-bar">
                    <div
                      className={`progress-fill${isFulfilled ? ' full' : ''}`}
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">
                    {totalNeeded > 0 ? `${totalContributed} / ${totalNeeded} units fulfilled` : `${(req.fulfilledBy || []).length} contribution(s)`}
                    {isFulfilled && ' — ✅ Fulfilled!'}
                    {req.deadline && !isFulfilled && ` • Deadline: ${getTimeUntil(req.deadline)}`}
                  </span>
                </div>

                {(req.fulfilledBy?.length || 0) > 0 && (
                  <div style={{ marginTop: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--color-bark-light)' }}>
                    <strong style={{ color: 'var(--color-bark)' }}>Contributions:</strong>
                    {req.fulfilledBy.map((f, i) => (
                      <span key={i} style={{ marginLeft: 'var(--space-2)' }}>
                        {f.donor?.name || 'Anonymous'} ({f.items})
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions — only for active requests */}
                {!showHistory && req.status !== 'closed' && (
                  <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
                    {req.status !== 'fulfilled' && (
                      <button
                        className="btn btn-sm btn-olive"
                        onClick={() => handleMarkFulfilled(req._id)}
                      >
                        ✅ Mark Fulfilled
                      </button>
                    )}
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => handleCloseRequest(req._id)}
                    >
                      {req.status === 'fulfilled' ? '📜 Move to History' : 'Close Request'}
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
