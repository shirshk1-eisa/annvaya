import mongoose from 'mongoose';

const foodRequestSchema = new mongoose.Schema({
  ngo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    default: '',
    maxlength: 1000
  },
  itemsNeeded: [{
    item: { type: String, required: true },
    quantity: { type: String, required: true },
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    }
  }],
  status: {
    type: String,
    enum: ['open', 'partially_fulfilled', 'fulfilled', 'closed'],
    default: 'open'
  },
  fulfilledBy: [{
    donor: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String }
    },
    items: { type: String },
    date: { type: Date, default: Date.now }
  }],
  deadline: {
    type: Date
  }
}, {
  timestamps: true
});

foodRequestSchema.index({ status: 1, createdAt: -1 });

const FoodRequest = mongoose.model('FoodRequest', foodRequestSchema);
export default FoodRequest;
