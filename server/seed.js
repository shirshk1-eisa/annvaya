import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/User.js';
import Donation from './models/Donation.js';
import FoodRequest from './models/FoodRequest.js';
import Event from './models/Event.js';
import Pickup from './models/Pickup.js';

async function seed() {
  await connectDB();
  console.log('\n🌱 Seeding database...\n');

  // Clear existing data
  await User.deleteMany({});
  await Donation.deleteMany({});
  await FoodRequest.deleteMany({});
  await Event.deleteMany({});
  await Pickup.deleteMany({});
  console.log('   ✓ Cleared existing data');

  // --- Create Users ---
  const donor1 = await User.create({
    name: 'Aarav Sharma',
    email: 'aarav@example.com',
    password: 'password123',
    role: 'donor',
    phone: '+91 98765 43210',
    location: { address: '42, MG Road, Bengaluru, Karnataka', coordinates: [77.5946, 12.9716] },
    donorStats: { totalDonations: 24, mealsShared: 480, currentStreak: 7, badges: ['First Donation', 'Weekly Warrior', '100 Meals'] }
  });

  const ngo1 = await User.create({
    name: 'Annapurna Foundation',
    email: 'ngo@example.com',
    password: 'password123',
    role: 'ngo',
    phone: '+91 98765 11111',
    location: { address: '15, Koramangala, Bengaluru, Karnataka', coordinates: [77.6245, 12.9352] },
    ngoDetails: {
      organizationName: 'Annapurna Foundation',
      registrationNumber: 'NGO-KA-2024-1234',
      verified: true,
      missionStatement: 'Ensuring no one goes hungry in our community',
      areasServed: ['Koramangala', 'HSR Layout', 'BTM Layout', 'JP Nagar'],
      capacity: 500
    }
  });

  const donor2 = await User.create({
    name: 'Priya Catering',
    email: 'priya@example.com',
    password: 'password123',
    role: 'donor',
    phone: '+91 98765 22222',
    location: { address: 'Whitefield, Bengaluru', coordinates: [77.7500, 12.9698] },
    donorStats: { totalDonations: 12, mealsShared: 300, currentStreak: 3, badges: ['First Donation'] }
  });

  const donor3 = await User.create({
    name: 'Fresh Basket Store',
    email: 'freshbasket@example.com',
    password: 'password123',
    role: 'donor',
    phone: '+91 98765 33333',
    location: { address: 'Indiranagar, Bengaluru', coordinates: [77.6408, 12.9784] },
    donorStats: { totalDonations: 8, mealsShared: 120, currentStreak: 2, badges: ['First Donation'] }
  });

  const donor4 = await User.create({
    name: 'Meera Patel',
    email: 'meera@example.com',
    password: 'password123',
    role: 'donor',
    phone: '+91 98765 44444',
    location: { address: 'JP Nagar, Bengaluru', coordinates: [77.5857, 12.9063] },
    donorStats: { totalDonations: 5, mealsShared: 200, currentStreak: 1, badges: ['First Donation'] }
  });

  const donor5 = await User.create({
    name: 'Rajesh Bakery',
    email: 'rajesh@example.com',
    password: 'password123',
    role: 'donor',
    phone: '+91 98765 55555',
    location: { address: 'HSR Layout, Bengaluru', coordinates: [77.6500, 12.9121] },
    donorStats: { totalDonations: 15, mealsShared: 350, currentStreak: 5, badges: ['First Donation', 'Weekly Warrior'] }
  });

  const ngo2 = await User.create({
    name: 'Akshaya Patra Local',
    email: 'akshaya@example.com',
    password: 'password123',
    role: 'ngo',
    phone: '+91 98765 66666',
    location: { address: 'Jayanagar, Bengaluru', coordinates: [77.5800, 12.9250] },
    ngoDetails: {
      organizationName: 'Akshaya Patra Local',
      registrationNumber: 'NGO-KA-2024-5678',
      verified: true,
      missionStatement: 'Serving breakfast to 150 people daily',
      areasServed: ['Jayanagar', 'Basavanagudi', 'Banashankari'],
      capacity: 300
    }
  });

  const ngo3 = await User.create({
    name: 'Hope Kitchen',
    email: 'hope@example.com',
    password: 'password123',
    role: 'ngo',
    phone: '+91 98765 77777',
    location: { address: 'Malleshwaram, Bengaluru', coordinates: [77.5700, 12.9970] },
    ngoDetails: {
      organizationName: 'Hope Kitchen',
      registrationNumber: 'NGO-KA-2024-9012',
      verified: true,
      missionStatement: 'Community kitchen for underprivileged families',
      areasServed: ['Malleshwaram', 'Rajajinagar', 'Vijayanagar'],
      capacity: 200
    }
  });

  console.log('   ✓ Created 8 users (5 donors + 3 NGOs)');

  // --- Create Donations ---
  const d1 = await Donation.create({
    donor: donor1._id,
    foodType: 'cooked',
    title: 'Biryani & Raita from Family Gathering',
    description: 'Freshly prepared Hyderabadi biryani and raita, enough to serve about 40 people. From a birthday party.',
    quantity: '40 meals',
    dietaryInfo: ['non-vegetarian'],
    bestBefore: new Date(Date.now() + 6 * 60 * 60 * 1000),
    status: 'available',
    location: { address: 'MG Road, Bengaluru', coordinates: [77.5946, 12.9716] },
    pickupWindow: { start: new Date(Date.now() + 1 * 60 * 60 * 1000), end: new Date(Date.now() + 4 * 60 * 60 * 1000) }
  });

  const d2 = await Donation.create({
    donor: donor2._id,
    foodType: 'cooked',
    title: 'Dal, Rice & Sabzi - Corporate Lunch Surplus',
    description: 'Packed meals with dal, rice, mixed vegetable sabzi, and roti. All containers are sealed.',
    quantity: '85 meals',
    dietaryInfo: ['vegetarian'],
    bestBefore: new Date(Date.now() + 8 * 60 * 60 * 1000),
    status: 'accepted',
    acceptedBy: ngo1._id,
    location: { address: 'Whitefield, Bengaluru', coordinates: [77.7500, 12.9698] },
    pickupWindow: { start: new Date(Date.now() + 2 * 60 * 60 * 1000), end: new Date(Date.now() + 5 * 60 * 60 * 1000) }
  });

  const d3 = await Donation.create({
    donor: donor3._id,
    foodType: 'raw',
    title: 'Fresh Vegetables - End of Day Stock',
    description: 'Mix of seasonal vegetables: tomatoes, onions, potatoes, spinach, carrots. All fresh and edible.',
    quantity: '25 kg',
    dietaryInfo: ['vegetarian', 'vegan'],
    bestBefore: new Date(Date.now() + 48 * 60 * 60 * 1000),
    status: 'available',
    location: { address: 'Indiranagar, Bengaluru', coordinates: [77.6408, 12.9784] },
    pickupWindow: { start: new Date(Date.now() + 0.5 * 60 * 60 * 1000), end: new Date(Date.now() + 3 * 60 * 60 * 1000) }
  });

  const d4 = await Donation.create({
    donor: donor4._id,
    foodType: 'packaged',
    title: 'Biscuit Packets & Juice Boxes',
    description: '50 packets of biscuits and 30 juice boxes. All sealed with 3 months shelf life.',
    quantity: '80 items',
    dietaryInfo: ['vegetarian'],
    bestBefore: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    status: 'pickup_scheduled',
    acceptedBy: ngo1._id,
    location: { address: 'JP Nagar, Bengaluru', coordinates: [77.5857, 12.9063] },
    pickupWindow: { start: new Date(Date.now() + 1 * 60 * 60 * 1000), end: new Date(Date.now() + 6 * 60 * 60 * 1000) }
  });

  const d5 = await Donation.create({
    donor: donor1._id,
    foodType: 'cooked',
    title: 'Chapati & Dal - Home Cooked',
    description: '20 chapatis with dal and pickle. Home cooked with love!',
    quantity: '10 meals',
    dietaryInfo: ['vegetarian'],
    bestBefore: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: 'delivered',
    acceptedBy: ngo1._id,
    location: { address: 'MG Road, Bengaluru', coordinates: [77.5946, 12.9716] },
    pickupWindow: { start: new Date(Date.now() - 8 * 60 * 60 * 1000), end: new Date(Date.now() - 5 * 60 * 60 * 1000) }
  });

  const d6 = await Donation.create({
    donor: donor5._id,
    foodType: 'packaged',
    title: 'Bread Loaves & Pastries - End of Day',
    description: 'Fresh bread loaves (8) and assorted pastries (12). Baked today morning.',
    quantity: '20 items',
    dietaryInfo: ['vegetarian'],
    bestBefore: new Date(Date.now() + 12 * 60 * 60 * 1000),
    status: 'available',
    location: { address: 'HSR Layout, Bengaluru', coordinates: [77.6500, 12.9121] },
    pickupWindow: { start: new Date(), end: new Date(Date.now() + 2 * 60 * 60 * 1000) }
  });

  console.log('   ✓ Created 6 donations');

  // --- Create Food Requests ---
  await FoodRequest.create({
    ngo: ngo1._id,
    title: 'Weekly Ration for 200 Children',
    description: 'Our shelter houses 200 children and we need basic ration supplies for the upcoming week.',
    itemsNeeded: [
      { item: 'Rice', quantity: '50 kg', urgency: 'high' },
      { item: 'Dal (Toor)', quantity: '20 kg', urgency: 'high' },
      { item: 'Cooking Oil', quantity: '10 liters', urgency: 'medium' },
      { item: 'Milk', quantity: '30 liters', urgency: 'critical' }
    ],
    status: 'open',
    fulfilledBy: [{ donor: { id: donor1._id, name: 'Aarav Sharma' }, items: 'Rice - 10 kg', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }],
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
  });

  await FoodRequest.create({
    ngo: ngo2._id,
    title: 'Urgent: Bread & Milk for Morning Meals',
    description: 'We serve breakfast to 150 people daily. Running short on bread and milk for the next 3 days.',
    itemsNeeded: [
      { item: 'Bread Loaves', quantity: '30 loaves', urgency: 'critical' },
      { item: 'Milk', quantity: '50 liters', urgency: 'critical' },
      { item: 'Eggs', quantity: '100', urgency: 'high' },
      { item: 'Butter', quantity: '5 kg', urgency: 'medium' }
    ],
    status: 'partially_fulfilled',
    fulfilledBy: [{ donor: { id: donor5._id, name: 'Rajesh Bakery' }, items: 'Bread - 10 loaves', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }],
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
  });

  await FoodRequest.create({
    ngo: ngo3._id,
    title: 'Festival Special - Sweets for 500 People',
    description: 'For the upcoming Diwali celebration at our community center. We want to distribute sweets to 500 underprivileged families.',
    itemsNeeded: [
      { item: 'Assorted Sweets', quantity: '100 kg', urgency: 'medium' },
      { item: 'Dry Fruits', quantity: '20 kg', urgency: 'low' },
      { item: 'Fruit Juice', quantity: '200 bottles', urgency: 'low' }
    ],
    status: 'open',
    deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
  });

  console.log('   ✓ Created 3 food requests');

  // --- Create Events ---
  await Event.create({
    organizer: donor1._id,
    eventName: 'Sharma Wedding Reception',
    eventType: 'wedding',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    estimatedSurplus: '~200 meals worth of surplus expected',
    surplusQuantity: 200,
    surplusUnit: 'meals',
    foodTypes: ['Biryani', 'Paneer dishes', 'Desserts', 'Salads'],
    location: { address: 'Palace Grounds, Bengaluru', coordinates: [77.5773, 12.9982] },
    subscribedNgos: [ngo1._id, ngo2._id],
    claims: [
      { ngoId: ngo1._id, ngoName: 'Annapurna Foundation', quantityClaimed: 120 },
      { ngoId: ngo2._id, ngoName: 'Akshaya Patra Local', quantityClaimed: 80 }
    ],
    status: 'upcoming'
  });

  await Event.create({
    organizer: donor2._id,
    eventName: 'Annual Company Meetup Lunch',
    eventType: 'corporate',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    estimatedSurplus: '~150 packed meals expected',
    surplusQuantity: 150,
    surplusUnit: 'meals',
    foodTypes: ['North Indian Thali', 'South Indian Thali', 'Beverages'],
    location: { address: 'Convention Center, Whitefield', coordinates: [77.7500, 12.9698] },
    subscribedNgos: [ngo1._id],
    claims: [{ ngoId: ngo1._id, ngoName: 'Annapurna Foundation', quantityClaimed: 80 }],
    status: 'upcoming'
  });

  console.log('   ✓ Created 2 events');

  // --- Create Pickups ---
  await Pickup.create({
    donation: d2._id,
    ngo: ngo1._id,
    driver: 'Ravi Kumar',
    status: 'in-progress',
    scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
    notes: 'Gate #2 entry, ask for Mr. Reddy at the cafeteria.'
  });

  await Pickup.create({
    donation: d4._id,
    ngo: ngo1._id,
    driver: 'Suresh M',
    status: 'pending',
    scheduledTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
    notes: 'Apartment block C, 4th floor. Call before arriving.'
  });

  await Pickup.create({
    donation: d5._id,
    ngo: ngo1._id,
    driver: 'Ravi Kumar',
    status: 'completed',
    scheduledTime: new Date(Date.now() - 6 * 60 * 60 * 1000),
    notes: 'Collected successfully.'
  });

  console.log('   ✓ Created 3 pickups');

  console.log('\n✅ Database seeded successfully!');
  console.log('\n📋 Demo Accounts:');
  console.log('   Donor: aarav@example.com / password123');
  console.log('   NGO:   ngo@example.com / password123\n');

  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
