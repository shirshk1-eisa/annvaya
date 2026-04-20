import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiAlertTriangle, FiSend, FiCheck, FiX } from 'react-icons/fi';
import { getTimeUntil } from '../../utils/mockData';
import { foodRequestsAPI } from '../../utils/api';
import { getSocket } from '../../utils/socket';

export default function FoodRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [fulfillForm, setFulfillForm] = useState(null); // request ID being fulfilled
  const [fulfillSelections, setFulfillSelections] = useState({}); // { itemIndex: { selected: bool, quantity: string } }
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await foodRequestsAPI.getAll(showHistory);
      setRequests(data.requests || []);
    } catch (err) {
      console.error('Failed to load food requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [showHistory]);

  // Listen for real-time updates
  useEffect(() => {
    const socket = getSocket();
    const handleNewRequest = (request) => {
      setRequests(prev => {
        const exists = prev.find(r => r._id === request._id);
        if (exists) return prev;
        return [request, ...prev];
      });
    };
    const handleFulfilled = (request) => {
      setRequests(prev => prev.map(r => r._id === request._id ? request : r));
    };
    socket?.on('new-food-request', handleNewRequest);
    socket?.on('request-fulfilled', handleFulfilled);
    return () => {
      socket?.off('new-food-request', handleNewRequest);
      socket?.off('request-fulfilled', handleFulfilled);
    };
  }, []);

  const openFulfillForm = (reqId, items) => {
    setFulfillForm(reqId);
    // Initialize selections — all unchecked, empty quantities
    const initial = {};
    items.forEach((_, i) => {
      initial[i] = { selected: false, quantity: '' };
    });
    setFulfillSelections(initial);
  };

  const toggleItem = (index) => {
    setFulfillSelections(prev => ({
      ...prev,
      [index]: { ...prev[index], selected: !prev[index]?.selected }
    }));
  };

  const updateQuantity = (index, value) => {
    setFulfillSelections(prev => ({
      ...prev,
      [index]: { ...prev[index], quantity: value, selected: true }
    }));
  };

  const handleFulfill = async (requestId, items) => {
    // Build a summary string of selected items
    const selectedItems = Object.entries(fulfillSelections)
      .filter(([_, v]) => v.selected && v.quantity.trim())
      .map(([idx, v]) => `${items[idx].item} — ${v.quantity}`)
      .join(', ');

    if (!selectedItems) return;

    try {
      setSubmitting(true);
      await foodRequestsAPI.fulfill(requestId, selectedItems);
      setFulfillForm(null);
      setFulfillSelections({});
      fetchRequests(); // Refresh
    } catch (err) {
      console.error('Failed to fulfill:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const hasAnySelected = () => {
    return Object.values(fulfillSelections).some(v => v.selected && v.quantity?.trim());
  };

  const urgencyColors = {
    low: 'badge-olive',
    medium: 'badge-ochre',
    high: 'badge-earth',
    critical: 'badge-wine'
  };

  const urgencyLabels = {
    low: '🟢',
    medium: '🟡',
    high: '🟠',
    critical: '🔴'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        <h2>NGO Food Requests</h2>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
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
        </div>
      </div>
      <p style={{ color: 'var(--color-bark-light)', marginBottom: 'var(--space-6)' }}>
        {showHistory
          ? 'Previously fulfilled requests and your past contributions'
          : 'See what NGOs need and help fulfill their requests directly. Select items you can provide and specify quantities.'}
      </p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--color-bark-light)' }}>
          <p>Loading requests...</p>
        </div>
      ) : (
        <div className="request-board">
          {requests.length === 0 && (
            <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--color-bark-light)' }}>
              <p style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>{showHistory ? '📜' : '📋'}</p>
              <h3>{showHistory ? 'No history yet' : 'No food requests right now'}</h3>
              <p>{showHistory ? 'Fulfilled requests you contributed to will appear here' : 'Check back later — NGOs will post their needs here!'}</p>
            </div>
          )}

          {requests.map((req, index) => {
            const ngoName = req.ngo?.ngoDetails?.organizationName || req.ngo?.name || 'NGO';

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

            // Calculate real progress based on quantities
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
                  <span className={`badge ${req.status === 'open' ? 'badge-olive' : req.status === 'partially_fulfilled' ? 'badge-ochre' : 'badge-earth'}`}>
                    {(req.status || 'open').replace('_', ' ')}
                  </span>
                </div>

                <h3 className="request-title">{req.title}</h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-bark-light)', marginBottom: 'var(--space-4)', lineHeight: 1.6 }}>
                  {req.description}
                </p>

                {/* Items needed — displayed as a table-like list */}
                <div style={{
                  background: 'var(--color-sand-light)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-3) var(--space-4)',
                  marginBottom: 'var(--space-4)',
                }}>
                  <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-bark-light)', marginBottom: 'var(--space-2)' }}>
                    Items Needed
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
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
                            <span style={{ fontWeight: 500, fontSize: 'var(--text-sm)' }}>
                              {urgencyLabels[item.urgency] || '🟡'} {item.item}
                            </span>
                            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: itemDone ? 'var(--color-olive)' : 'var(--color-bark-light)' }}>
                              {itemContributed > 0 ? `${itemContributed} / ` : ''}{item.quantity}
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
                </div>

                {/* Progress bar */}
                <div className="request-progress">
                  <div className="progress-bar">
                    <div
                      className={`progress-fill${isFulfilled ? ' full' : ''}`}
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">
                    {totalNeeded > 0 ? `${totalContributed} / ${totalNeeded} units fulfilled` : `${(req.fulfilledBy || []).length} contribution(s)`}
                    {isFulfilled && ' — ✅ Request Fulfilled!'}
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

                {/* Fulfill action for donors */}
                {!isFulfilled && req.status !== 'closed' && (
                  <div style={{ marginTop: 'var(--space-4)' }}>
                    {fulfillForm === req._id ? (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        style={{
                          background: 'rgba(107, 127, 59, 0.04)',
                          borderRadius: 'var(--radius-md)',
                          padding: 'var(--space-4)',
                          border: '1px solid rgba(107, 127, 59, 0.15)',
                        }}
                      >
                        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>
                          Select items you can provide:
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                          {(req.itemsNeeded || []).map((item, i) => (
                            <div key={i} style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 'var(--space-3)',
                              flexWrap: 'wrap'
                            }}>
                              <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-2)',
                                cursor: 'pointer',
                                flex: '1 1 150px',
                                minWidth: '150px',
                                fontSize: 'var(--text-sm)',
                                fontWeight: 500
                              }}>
                                <input
                                  type="checkbox"
                                  checked={fulfillSelections[i]?.selected || false}
                                  onChange={() => toggleItem(i)}
                                  style={{ width: '18px', height: '18px', accentColor: 'var(--color-olive)', cursor: 'pointer' }}
                                />
                                {item.item}
                                <span style={{ color: 'var(--color-bark-light)', fontWeight: 400 }}>
                                  (need: {item.quantity})
                                </span>
                              </label>
                              <input
                                type="text"
                                className="form-input"
                                placeholder={`Your qty (e.g., ${item.quantity})`}
                                value={fulfillSelections[i]?.quantity || ''}
                                onChange={(e) => updateQuantity(i, e.target.value)}
                                style={{
                                  flex: '0 1 180px',
                                  padding: 'var(--space-2) var(--space-3)',
                                  fontSize: 'var(--text-sm)'
                                }}
                              />
                            </div>
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-4)', justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-sm btn-ghost"
                            onClick={() => { setFulfillForm(null); setFulfillSelections({}); }}
                          >
                            <FiX size={14} /> Cancel
                          </button>
                          <button
                            className="btn btn-sm btn-olive"
                            onClick={() => handleFulfill(req._id, req.itemsNeeded)}
                            disabled={submitting || !hasAnySelected()}
                          >
                            <FiSend size={14} /> {submitting ? 'Sending...' : 'Submit Contribution'}
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <button
                        className="btn btn-sm btn-olive"
                        onClick={() => openFulfillForm(req._id, req.itemsNeeded || [])}
                      >
                        🤝 I can help with this
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
