import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventName: {
    type: String,
    required: [true, 'Event name is required'],
    trim: true,
    maxlength: 200
  },
  eventType: {
    type: String,
    enum: ['wedding', 'corporate', 'festival', 'community', 'other'],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  estimatedSurplus: {
    type: String,
    default: ''
  },
  surplusQuantity: {
    type: Number,
    default: 0
  },
  surplusUnit: {
    type: String,
    default: 'meals'
  },
  foodTypes: [{
    type: String
  }],
  location: {
    address: { type: String, default: '' },
    coordinates: {
      type: [Number],
      default: [77.5946, 12.9716]
    }
  },
  subscribedNgos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  claims: [{
    ngoId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ngoName: { type: String },
    quantityClaimed: { type: Number }
  }],
  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed'],
    default: 'upcoming'
  }
}, {
  timestamps: true
});

eventSchema.index({ status: 1, date: 1 });

const Event = mongoose.model('Event', eventSchema);
export default Event;
