import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// POST /api/auth/register
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['donor', 'ngo']).withMessage('Role must be donor or ngo')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { name, email, password, role, phone, organizationName } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create user
    const userData = { name, email, password, role, phone: phone || '' };

    if (role === 'donor') {
      userData.donorStats = { totalDonations: 0, mealsShared: 0, currentStreak: 0, badges: [] };
    }

    if (role === 'ngo') {
      userData.ngoDetails = {
        organizationName: organizationName || name,
        registrationNumber: '',
        verified: false,
        missionStatement: '',
        areasServed: [],
        capacity: 0
      };
    }

    const user = await User.create(userData);
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: user.toPublicJSON()
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { email, password } = req.body;

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: user.toPublicJSON()
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me — Get current user profile
router.get('/me', auth, async (req, res) => {
  res.json({ success: true, user: req.user.toPublicJSON() });
});

// PUT /api/auth/profile — Update profile
router.put('/profile', auth, async (req, res, next) => {
  try {
    const allowedUpdates = ['name', 'phone', 'location'];
    const updates = {};

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Role-specific updates
    if (req.user.role === 'ngo' && req.body.ngoDetails) {
      updates.ngoDetails = { ...req.user.ngoDetails, ...req.body.ngoDetails };
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, user: user.toPublicJSON() });
  } catch (error) {
    next(error);
  }
});

export default router;
