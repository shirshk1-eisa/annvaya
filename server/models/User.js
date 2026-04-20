import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false // Don't return password by default
  },
  role: {
    type: String,
    enum: ['donor', 'ngo'],
    required: [true, 'Role is required']
  },
  phone: {
    type: String,
    default: ''
  },
  location: {
    address: { type: String, default: '' },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [77.5946, 12.9716] // Default: Bengaluru
    }
  },
  // Donor-specific fields
  donorStats: {
    totalDonations: { type: Number, default: 0 },
    mealsShared: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    badges: [{ type: String }]
  },
  // NGO-specific fields
  ngoDetails: {
    organizationName: { type: String, default: '' },
    registrationNumber: { type: String, default: '' },
    verified: { type: Boolean, default: false },
    missionStatement: { type: String, default: '' },
    areasServed: [{ type: String }],
    capacity: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Return user without sensitive fields
userSchema.methods.toPublicJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

const User = mongoose.model('User', userSchema);
export default User;
