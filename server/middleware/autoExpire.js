import FoodRequest from '../models/FoodRequest.js';
import Donation from '../models/Donation.js';

/**
 * Auto-expire middleware - runs on each API request to clean up stale data:
 * 1. Food requests past their deadline → status = 'closed'
 * 2. Donations past bestBefore and still available → status = 'expired'
 */
const autoExpire = async (req, res, next) => {
  try {
    const now = new Date();

    // Auto-close food requests past deadline
    await FoodRequest.updateMany(
      {
        deadline: { $lt: now },
        status: { $in: ['open', 'partially_fulfilled'] }
      },
      { $set: { status: 'closed' } }
    );

    // Auto-expire donations past bestBefore that are still available
    await Donation.updateMany(
      {
        bestBefore: { $lt: now },
        status: 'available'
      },
      { $set: { status: 'expired' } }
    );
  } catch (err) {
    // Don't block the request if expiry check fails
    console.error('Auto-expire check failed:', err.message);
  }
  next();
};

export default autoExpire;
