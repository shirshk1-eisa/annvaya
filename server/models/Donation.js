import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  foodType: {
    type: String,
    enum: ['cooked', 'raw', 'packaged', 'beverages', 'mixed'],
    required: [true, 'Food type is required']
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
  quantity: {
    type: String,
    required: [true, 'Quantity is required']
  },
  photos: [{
    type: String // URLs
  }],
  dietaryInfo: [{
    type: String,
    enum: ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Gluten-Free', 'vegetarian', 'non-vegetarian', 'vegan', 'gluten-free']
  }],
  bestBefore: {
    type: Date
  },
  status: {
    type: String,
    enum: ['available', 'accepted', 'pickup_scheduled', 'picked_up', 'delivered', 'expired'],
    default: 'available'
  },
  deliveryMode: {
    type: String,
    enum: ['pickup', 'self'],
    default: 'pickup'
  },
  location: {
    address: { type: String, default: '' },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [77.5946, 12.9716]
    }
  },
  pickupWindow: {
    start: { type: Date },
    end: { type: Date }
  },
  acceptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  phone: {
    type: String,
    default: ''
  },
  isEventDonation: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
donationSchema.index({ status: 1, createdAt: -1 });
donationSchema.index({ donor: 1, status: 1 });
donationSchema.index({ foodType: 1, status: 1 });

const Donation = mongoose.model('Donation', donationSchema);
export default Donation;
