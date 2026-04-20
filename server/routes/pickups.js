import express from 'express';
import Pickup from '../models/Pickup.js';
import Donation from '../models/Donation.js';
import Event from '../models/Event.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// GET /api/pickups — List pickups for user
router.get('/', auth, async (req, res, next) => {
  try {
    const { history } = req.query;
    const filter = { ngo: req.user._id };

    if (history === 'true') {
      filter.status = { $in: ['completed', 'cancelled'] };
    } else {
      filter.status = { $nin: ['completed', 'cancelled'] };
    }

    const pickups = await Pickup.find(filter)
      .populate({
        path: 'donation',
        populate: { path: 'donor', select: 'name phone location' }
      })
      .populate({
        path: 'event',
        populate: { path: 'organizer', select: 'name phone location' }
      })
      .populate('ngo', 'name ngoDetails')
      .sort({ scheduledTime: 1 });

    res.json({ success: true, pickups });
  } catch (error) {
    next(error);
  }
});

// POST /api/pickups — Schedule a pickup
router.post('/', auth, async (req, res, next) => {
  try {
    const { donationId, eventId, scheduledTime, driver, contact, notes } = req.body;

    const pickupData = {
      ngo: req.user._id,
      driver: driver || 'Unassigned',
      contact: contact || '',
      scheduledTime: scheduledTime || new Date(),
      notes: notes || ''
    };

    if (donationId) {
      // Donation pickup — check for existing active pickup
      const existingPickup = await Pickup.findOne({
        donation: donationId,
        ngo: req.user._id,
        status: { $nin: ['completed', 'cancelled'] }
      });
      if (existingPickup) {
        return res.status(400).json({ error: 'You already have an active pickup for this donation' });
      }

      const donation = await Donation.findById(donationId);
      if (!donation) {
        return res.status(404).json({ error: 'Donation not found' });
      }
      donation.status = 'pickup_scheduled';
      donation.acceptedBy = req.user._id;
      await donation.save();
      pickupData.donation = donationId;

    } else if (eventId) {
      // Event pickup — check for existing active pickup by same NGO
      const existingPickup = await Pickup.findOne({
        event: eventId,
        ngo: req.user._id,
        status: { $nin: ['completed', 'cancelled'] }
      });
      if (existingPickup) {
        return res.status(400).json({ error: 'You already have an active pickup for this event' });
      }

      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
      pickupData.event = eventId;

    } else {
      return res.status(400).json({ error: 'Either donationId or eventId is required' });
    }

    const pickup = await Pickup.create(pickupData);

    if (pickup.donation) {
      await pickup.populate({
        path: 'donation',
        populate: { path: 'donor', select: 'name phone location' }
      });
    }
    if (pickup.event) {
      await pickup.populate({
        path: 'event',
        populate: { path: 'organizer', select: 'name phone location' }
      });
    }
    await pickup.populate('ngo', 'name ngoDetails');

    const io = req.app.get('io');
    if (io) {
      io.emit('pickup-update', pickup);
      if (pickupData.donation) {
        const donation = await Donation.findById(donationId);
        io.emit('donation-status-changed', donation);
      }
    }

    res.status(201).json({ success: true, pickup });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/pickups/:id/status — Update pickup status
router.patch('/:id/status', auth, async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'in-progress', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const pickup = await Pickup.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
    .populate({
      path: 'donation',
      populate: { path: 'donor', select: 'name phone location' }
    })
    .populate({
      path: 'event',
      populate: { path: 'organizer', select: 'name phone location' }
    })
    .populate('ngo', 'name ngoDetails');

    if (!pickup) {
      return res.status(404).json({ error: 'Pickup not found' });
    }

    // If this is a DONATION pickup, update donation status
    if (pickup.donation) {
      if (status === 'completed') {
        await Donation.findByIdAndUpdate(pickup.donation._id, { status: 'delivered' });
      }
      if (status === 'cancelled') {
        await Donation.findByIdAndUpdate(pickup.donation._id, {
          status: 'available',
          acceptedBy: null
        });
      }
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('pickup-update', pickup);
      if (pickup.donation) {
        io.emit('donation-status-changed', pickup.donation);
      }
    }

    res.json({ success: true, pickup });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/pickups/:id — Cancel pickup
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const pickup = await Pickup.findById(req.params.id);
    if (!pickup) {
      return res.status(404).json({ error: 'Pickup not found' });
    }

    // Revert donation to available (only if it's a donation pickup)
    if (pickup.donation) {
      await Donation.findByIdAndUpdate(pickup.donation, {
        status: 'available',
        acceptedBy: null
      });
    }

    await Pickup.findByIdAndDelete(req.params.id);

    const io = req.app.get('io');
    if (io) {
      io.emit('pickup-update', { ...pickup.toObject(), status: 'cancelled' });
    }

    res.json({ success: true, message: 'Pickup cancelled' });
  } catch (error) {
    next(error);
  }
});

export default router;
