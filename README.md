# 🌾 Annvaya — Food Donation Platform

A full-stack food donation platform connecting donors with NGOs. Built with React + Node.js + MongoDB + Socket.io for real-time updates.

## 📁 Project Structure

```
annvaya/
├── client/          ← Frontend (React + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── donor/       ← Donor portal components
│   │   │   ├── ngo/         ← NGO portal components
│   │   │   ├── shared/      ← Shared components (Profile, etc.)
│   │   │   └── landing/     ← Landing page
│   │   ├── context/         ← Auth context
│   │   ├── utils/           ← API, socket, helpers
│   │   └── assets/          ← Images, fonts
│   └── package.json
│
├── server/          ← Backend (Node.js + Express)
│   ├── config/              ← Database connection
│   ├── middleware/           ← Auth, error handler, auto-expire
│   ├── models/              ← Mongoose schemas (User, Donation, Event, Pickup, FoodRequest)
│   ├── routes/              ← API routes (auth, donations, events, pickups, food-requests)
│   ├── socket.js            ← Socket.io real-time setup
│   ├── index.js             ← Server entry point
│   └── package.json
│
├── .gitignore               ← Root gitignore (covers both client & server)
└── README.md                ← This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account
- npm

### 1. Clone & Install

```bash
git clone https://github.com/shirshk1-eisa/annvaya.git
cd annvaya

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Setup Environment Variables

Both `client/` and `server/` require `.env` files. Refer to the `.env.example` files in each directory for the required variables.

```bash
# Server
cp server/.env.example server/.env
# Edit server/.env with your values

# Client
cp client/.env.example client/.env
# Edit client/.env with your values
```

### 3. Run Locally

```bash
# Terminal 1 — Start backend
cd server
npm run dev

# Terminal 2 — Start frontend
cd client
npm run dev
```

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, Framer Motion |
| Backend | Node.js, Express |
| Database | MongoDB Atlas |
| Real-time | Socket.io |
| Auth | JWT + bcrypt |
| Maps | Leaflet / React-Leaflet |

## ⚠️ Important Notes

- **Never commit `.env` files** — they contain secrets. The `.gitignore` blocks them.
- **`.env.example` files ARE committed** — they show what variables are needed without actual values.
- MongoDB Atlas: Whitelist `0.0.0.0/0` in Network Access for cloud deployments.

## 📜 License

This project is proprietary. All rights reserved.
