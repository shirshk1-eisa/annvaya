import mongoose from 'mongoose';

const pickupSchema = new mongoose.Schema({
  donation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation',
    default: null
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    default: null
  },
  ngo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driver: {
    type: String,
    default: 'Unassigned'
  },
  contact: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  scheduledTime: {
    type: Date,
    required: true
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

pickupSchema.index({ ngo: 1, status: 1 });
pickupSchema.index({ donation: 1 });
pickupSchema.index({ event: 1 });
// Prevent duplicate active pickups: one NGO can have only one non-cancelled pickup per event
pickupSchema.index(
  { event: 1, ngo: 1 },
  { unique: true, partialFilterExpression: { event: { $ne: null }, status: { $nin: ['cancelled', 'completed'] } } }
);
// Same for donations
pickupSchema.index(
  { donation: 1, ngo: 1 },
  { unique: true, partialFilterExpression: { donation: { $ne: null }, status: { $nin: ['cancelled', 'completed'] } } }
);

const Pickup = mongoose.model('Pickup', pickupSchema);
export default Pickup;
