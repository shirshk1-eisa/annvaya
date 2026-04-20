import express from 'express';
import Event from '../models/Event.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// GET /api/events — List all events
router.get('/', auth, async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const events = await Event.find(filter)
      .populate('organizer', 'name email')
      .sort({ date: 1 });

    res.json({ success: true, events });
  } catch (error) {
    next(error);
  }
});

// POST /api/events — Create event
router.post('/', auth, async (req, res, next) => {
  try {
    const {
      eventName, eventType, date, estimatedSurplus,
      surplusQuantity, surplusUnit, foodTypes, address
    } = req.body;

    const event = await Event.create({
      organizer: req.user._id,
      eventName,
      eventType,
      date,
      estimatedSurplus,
      surplusQuantity: surplusQuantity || 0,
      surplusUnit: surplusUnit || 'meals',
      foodTypes: foodTypes || [],
      location: {
        address: address || '',
        coordinates: req.user.location?.coordinates || [77.5946, 12.9716]
      }
    });

    await event.populate('organizer', 'name email');

    const io = req.app.get('io');
    if (io) {
      io.emit('new-event', event);
    }

    res.status(201).json({ success: true, event });
  } catch (error) {
    next(error);
  }
});

// GET /api/events/my — Organizer's own events
router.get('/my', auth, async (req, res, next) => {
  try {
    const events = await Event.find({ organizer: req.user._id })
      .populate('organizer', 'name email')
      .populate('subscribedNgos', 'name ngoDetails')
      .sort({ date: -1 })
      .lean();

    // Attach pickup info for each event
    const eventIds = events.map(e => e._id);
    const Pickup = (await import('../models/Pickup.js')).default;
    const pickups = await Pickup.find({ event: { $in: eventIds } })
      .populate('ngo', 'name ngoDetails')
      .lean();

    const pickupsByEvent = {};
    for (const p of pickups) {
      const eid = p.event.toString();
      if (!pickupsByEvent[eid]) pickupsByEvent[eid] = [];
      pickupsByEvent[eid].push(p);
    }

    const now = new Date();
    const eventsWithPickups = events.map(e => {
      const eventPickups = pickupsByEvent[e._id.toString()] || [];
      const activePickups = eventPickups.filter(p => p.status !== 'cancelled');
      const allCompleted = activePickups.length > 0 && activePickups.every(p => p.status === 'completed');
      const eventDatePassed = new Date(e.date) < now;

      // Compute display status
      let displayStatus = e.status || 'upcoming';
      if (allCompleted) {
        displayStatus = 'completed';
      } else if (eventDatePassed && !allCompleted) {
        displayStatus = 'expired';
      }

      return {
        ...e,
        pickups: eventPickups,
        displayStatus,
      };
    });

    res.json({ success: true, events: eventsWithPickups });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/events/:id/claim — NGO claims surplus
router.patch('/:id/claim', auth, async (req, res, next) => {
  try {
    const { quantityClaimed } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check total claimed capacity
    const totalClaimed = event.claims.reduce((sum, c) => sum + (c.quantityClaimed || 0), 0);
    const surplusQty = event.surplusQuantity || 0;

    // Check if NGO already claimed
    const existingClaim = event.claims.find(
      c => c.ngoId.toString() === req.user._id.toString()
    );

    if (existingClaim) {
      // Validate remaining capacity (exclude current claim)
      const othersTotal = totalClaimed - existingClaim.quantityClaimed;
      if (surplusQty > 0 && (othersTotal + quantityClaimed) > surplusQty) {
        return res.status(400).json({ error: `Only ${surplusQty - othersTotal} ${event.surplusUnit || 'meals'} remaining` });
      }
      existingClaim.quantityClaimed = quantityClaimed;
    } else {
      // Validate remaining capacity
      if (surplusQty > 0 && (totalClaimed + quantityClaimed) > surplusQty) {
        return res.status(400).json({ error: `Only ${surplusQty - totalClaimed} ${event.surplusUnit || 'meals'} remaining` });
      }
      event.claims.push({
        ngoId: req.user._id,
        ngoName: req.user.ngoDetails?.organizationName || req.user.name,
        quantityClaimed
      });
    }

    // Subscribe if not already — use .some() for reliable ObjectId comparison
    const alreadySubscribed = event.subscribedNgos.some(
      id => id.toString() === req.user._id.toString()
    );
    if (!alreadySubscribed) {
      event.subscribedNgos.push(req.user._id);
    }

    await event.save();
    await event.populate('organizer', 'name email');
    await event.populate('subscribedNgos', 'name ngoDetails');

    const io = req.app.get('io');
    if (io) io.emit('event-updated', event);

    res.json({ success: true, event });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/events/:id/subscribe — NGO subscribes
router.patch('/:id/subscribe', auth, async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const alreadySubscribed = event.subscribedNgos.some(
      id => id.toString() === req.user._id.toString()
    );
    if (!alreadySubscribed) {
      event.subscribedNgos.push(req.user._id);
      await event.save();
    }

    await event.populate('organizer', 'name email');
    await event.populate('subscribedNgos', 'name ngoDetails');

    const io = req.app.get('io');
    if (io) io.emit('event-updated', event);

    res.json({ success: true, event });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/events/:id/unsubscribe — NGO cancels subscription
router.patch('/:id/unsubscribe', auth, async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Remove from subscribedNgos
    event.subscribedNgos = event.subscribedNgos.filter(
      id => id.toString() !== req.user._id.toString()
    );

    // Remove claim
    event.claims = event.claims.filter(
      c => c.ngoId.toString() !== req.user._id.toString()
    );

    await event.save();
    await event.populate('organizer', 'name email');
    await event.populate('subscribedNgos', 'name ngoDetails');

    const io = req.app.get('io');
    if (io) io.emit('event-updated', event);

    res.json({ success: true, event });
  } catch (error) {
    next(error);
  }
});

export default router;
