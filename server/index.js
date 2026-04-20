import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import connectDB from './config/db.js';
import setupSocket from './socket.js';
import errorHandler from './middleware/errorHandler.js';
import autoExpire from './middleware/autoExpire.js';

// Route imports
import authRoutes from './routes/auth.js';
import donationRoutes from './routes/donations.js';
import foodRequestRoutes from './routes/foodRequests.js';
import eventRoutes from './routes/events.js';
import pickupRoutes from './routes/pickups.js';

const app = express();
const httpServer = createServer(app);

// Setup Socket.io
const io = setupSocket(httpServer);
app.set('io', io); // Make io accessible in routes via req.app.get('io')

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Auto-expire stale food requests and donations on every request
app.use('/api/donations', autoExpire);
app.use('/api/food-requests', autoExpire);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/food-requests', foodRequestRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/pickups', pickupRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Annvaya API is running 🌾' });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`\n🌾 Annvaya Server running on port ${PORT}`);
    console.log(`   API:    http://localhost:${PORT}/api/health`);
    console.log(`   Socket: ws://localhost:${PORT}\n`);
  });
});
