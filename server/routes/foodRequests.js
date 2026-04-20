import express from 'express';
import FoodRequest from '../models/FoodRequest.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// GET /api/food-requests — List all open requests
router.get('/', auth, async (req, res, next) => {
  try {
    const { history } = req.query;
    const filter = {};

    if (history === 'true') {
      filter.status = { $in: ['fulfilled', 'closed'] };
    } else {
      filter.status = { $nin: ['fulfilled', 'closed'] };
    }

    const requests = await FoodRequest.find(filter)
      .populate('ngo', 'name ngoDetails')
      .sort({ createdAt: -1 });

    res.json({ success: true, requests });
  } catch (error) {
    next(error);
  }
});

// GET /api/food-requests/my — NGO's own requests
router.get('/my', auth, async (req, res, next) => {
  try {
    const { history } = req.query;
    const filter = { ngo: req.user._id };

    if (history === 'true') {
      filter.status = { $in: ['fulfilled', 'closed'] };
    } else {
      filter.status = { $nin: ['fulfilled', 'closed'] };
    }

    const requests = await FoodRequest.find(filter)
      .sort({ createdAt: -1 });

    res.json({ success: true, requests });
  } catch (error) {
    next(error);
  }
});

// POST /api/food-requests — Create a new request
router.post('/', auth, async (req, res, next) => {
  try {
    const { title, description, itemsNeeded, deadline } = req.body;

    const request = await FoodRequest.create({
      ngo: req.user._id,
      title,
      description,
      itemsNeeded: itemsNeeded || [],
      deadline: deadline || undefined
    });

    await request.populate('ngo', 'name ngoDetails');

    // Emit to all donors
    const io = req.app.get('io');
    if (io) {
      io.emit('new-food-request', request);
    }

    res.status(201).json({ success: true, request });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/food-requests/:id/fulfill — Donor fulfills items
router.patch('/:id/fulfill', auth, async (req, res, next) => {
  try {
    const { items } = req.body;
    const request = await FoodRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ error: 'Food request not found' });
    }

    request.fulfilledBy.push({
      donor: { id: req.user._id, name: req.user.name },
      items,
      date: new Date()
    });

    // Calculate fulfillment progress by parsing contributed quantities
    const contributedMap = {}; // { itemName: totalQty }
    for (const entry of request.fulfilledBy) {
      // Items string format: "Wheat Flour — 20, Rice — 10"
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

    // Compare against needed quantities
    let totalNeeded = 0;
    let totalContributed = 0;
    for (const needed of request.itemsNeeded) {
      const neededQty = parseInt(needed.quantity) || 0;
      const neededName = needed.item.trim().toLowerCase();
      const contributed = contributedMap[neededName] || 0;
      totalNeeded += neededQty;
      totalContributed += Math.min(contributed, neededQty); // Cap at needed
    }

    // Status stays as partially_fulfilled — only NGO can mark as fulfilled manually
    if (request.fulfilledBy.length > 0 && request.status === 'open') {
      request.status = 'partially_fulfilled';
    }

    await request.save();
    await request.populate('ngo', 'name ngoDetails');

    // Emit to NGO
    const io = req.app.get('io');
    if (io) {
      io.emit('request-fulfilled', request);
    }

    res.json({ success: true, request });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/food-requests/:id/status — Update status
router.patch('/:id/status', auth, async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['open', 'partially_fulfilled', 'fulfilled', 'closed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const request = await FoodRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('ngo', 'name ngoDetails');

    if (!request) {
      return res.status(404).json({ error: 'Food request not found' });
    }

    res.json({ success: true, request });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/food-requests/:id — Cancel/delete a request
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const request = await FoodRequest.findOne({ _id: req.params.id, ngo: req.user._id });

    if (!request) {
      return res.status(404).json({ error: 'Food request not found or not authorized' });
    }

    await FoodRequest.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Food request deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
