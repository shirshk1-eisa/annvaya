import express from 'express';
import Donation from '../models/Donation.js';
import Pickup from '../models/Pickup.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// GET /api/donations — List donations (with filters)
router.get('/', auth, async (req, res, next) => {
  try {
    const { foodType, status, history } = req.query;
    const filter = {};

    // History mode: show completed/expired items
    if (history === 'true') {
      filter.status = { $in: ['delivered', 'expired'] };
    } else {
      // Active mode: exclude completed items
      filter.status = { $nin: ['delivered', 'expired'] };
    }

    // Additional filters
    if (foodType && foodType !== 'all') filter.foodType = foodType;
    if (status && !history) filter.status = status;

    const donations = await Donation.find(filter)
      .populate('donor', 'name email phone location')
      .populate('acceptedBy', 'name email ngoDetails')
      .sort({ createdAt: -1 });

    res.json({ success: true, donations });
  } catch (error) {
    next(error);
  }
});

// GET /api/donations/my — Donor's own donations
router.get('/my', auth, async (req, res, next) => {
  try {
    const { history } = req.query;
    const filter = { donor: req.user._id };

    if (history === 'true') {
      filter.status = { $in: ['delivered', 'expired'] };
    } else {
      filter.status = { $nin: ['delivered', 'expired'] };
    }

    const donations = await Donation.find(filter)
      .populate('acceptedBy', 'name ngoDetails')
      .sort({ createdAt: -1 })
      .lean();

    // Attach pickup info for each donation
    const donationIds = donations.map(d => d._id);
    const pickups = await Pickup.find({ donation: { $in: donationIds } })
      .populate('ngo', 'name ngoDetails')
      .lean();

    const pickupMap = {};
    for (const p of pickups) {
      pickupMap[p.donation.toString()] = p;
    }

    const donationsWithPickup = donations.map(d => ({
      ...d,
      pickup: pickupMap[d._id.toString()] || null
    }));

    res.json({ success: true, donations: donationsWithPickup });
  } catch (error) {
    next(error);
  }
});

// POST /api/donations — Create a new donation
router.post('/', auth, async (req, res, next) => {
  try {
    const {
      foodType, title, description, quantity, dietaryInfo,
      bestBefore, deliveryMode, address, pickupStart, pickupEnd, phone
    } = req.body;

    const donation = await Donation.create({
      donor: req.user._id,
      foodType,
      title,
      description,
      quantity,
      dietaryInfo: dietaryInfo || [],
      bestBefore: bestBefore || undefined,
      deliveryMode: deliveryMode || 'pickup',
      location: {
        address: address || req.user.location?.address || '',
        coordinates: req.user.location?.coordinates || [77.5946, 12.9716]
      },
      pickupWindow: {
        start: pickupStart || undefined,
        end: pickupEnd || undefined
      },
      phone: phone || '',
      status: 'available'
    });

    // Populate donor info for the response
    await donation.populate('donor', 'name email phone location');

    // Update donor stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'donorStats.totalDonations': 1 }
    });

    // Emit Socket.io event — new donation for NGOs to see
    const io = req.app.get('io');
    if (io) {
      io.emit('new-donation', donation);
    }

    res.status(201).json({ success: true, donation });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/donations/:id/accept — NGO accepts a donation
router.patch('/:id/accept', auth, async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    if (donation.status !== 'available') {
      return res.status(400).json({ error: 'Donation is no longer available' });
    }

    donation.status = 'accepted';
    donation.acceptedBy = req.user._id;
    await donation.save();

    await donation.populate('donor', 'name email phone location');
    await donation.populate('acceptedBy', 'name ngoDetails');

    // Emit to donor that their donation was accepted
    const io = req.app.get('io');
    if (io) {
      io.emit('donation-accepted', donation);
      io.emit('donation-status-changed', donation);
    }

    res.json({ success: true, donation });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/donations/:id/status — Update donation status
router.patch('/:id/status', auth, async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['available', 'accepted', 'pickup_scheduled', 'picked_up', 'delivered', 'expired'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const donation = await Donation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('donor', 'name email phone location')
     .populate('acceptedBy', 'name ngoDetails');

    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    // Emit status change
    const io = req.app.get('io');
    if (io) {
      io.emit('donation-status-changed', donation);
    }

    res.json({ success: true, donation });
  } catch (error) {
    next(error);
  }
});

// PUT /api/donations/:id — Update donation details
router.put('/:id', auth, async (req, res, next) => {
  try {
    const donation = await Donation.findOne({ _id: req.params.id, donor: req.user._id });
    if (!donation) {
      return res.status(404).json({ error: 'Donation not found or not authorized' });
    }

    const allowedUpdates = ['title', 'description', 'quantity', 'dietaryInfo', 'bestBefore', 'deliveryMode', 'phone'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        donation[field] = req.body[field];
      }
    });

    if (req.body.address) {
      donation.location.address = req.body.address;
    }

    await donation.save();
    res.json({ success: true, donation });
  } catch (error) {
    next(error);
  }
});

export default router;
