# 🌾 Annvaya — Food Donation Platform

A full-stack food donation platform connecting donors with NGOs. Built with React + Node.js + MongoDB + Socket.io for real-time updates.

## 📁 Project Structure

```
Full_Stack_Project/
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
│   ├── .env                 ← Client environment variables (NOT committed)
│   ├── .env.example         ← Template for client env
│   └── package.json
│
├── server/          ← Backend (Node.js + Express)
│   ├── config/              ← Database connection
│   ├── middleware/           ← Auth, error handler, auto-expire
│   ├── models/              ← Mongoose schemas (User, Donation, Event, Pickup, FoodRequest)
│   ├── routes/              ← API routes (auth, donations, events, pickups, food-requests)
│   ├── socket.js            ← Socket.io real-time setup
│   ├── index.js             ← Server entry point
│   ├── .env                 ← Server environment variables (NOT committed)
│   ├── .env.example         ← Template for server env
│   └── package.json
│
├── .gitignore               ← Root gitignore (covers both client & server)
└── README.md                ← This file
```

## 🚀 Local Development

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

```bash
# Server
cp server/.env.example server/.env
# Edit server/.env with your MongoDB URI, JWT secret, etc.

# Client
cp client/.env.example client/.env
# Edit client/.env with your backend URL
```

### 3. Run Locally

```bash
# Terminal 1 — Start backend (port 5000)
cd server
npm run dev

# Terminal 2 — Start frontend (port 5173)
cd client
npm run dev
```

Open http://localhost:5173

---

## 🌐 Deployment Guide

### Setup: Vercel (Frontend) + Render (Backend)

> **Why split?** Vercel is optimized for static/React apps with CDN edge caching. Render handles Node.js servers with persistent connections (Socket.io). This is the industry standard for full-stack apps.

### Step 1: Deploy Backend on Render

1. Go to [render.com](https://render.com) → New → **Web Service**
2. Connect your GitHub repo
3. Settings:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
   - **Environment:** Node
4. Add Environment Variables:
   - `MONGODB_URI` → your MongoDB Atlas connection string
   - `JWT_SECRET` → a strong random string
   - `PORT` → `5000`
   - `CLIENT_URL` → `https://your-app.vercel.app` (update after Vercel deploy)
5. Deploy → Copy the Render URL (e.g., `https://annvaya-server.onrender.com`)

### Step 2: Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Connect your GitHub repo
3. Settings:
   - **Root Directory:** `client`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add Environment Variable:
   - `VITE_API_URL` → `https://annvaya-server.onrender.com` (your Render URL)
5. Deploy → Copy the Vercel URL

### Step 3: Update CORS

Go back to Render → your service → Environment → Update:
- `CLIENT_URL` → `https://your-app.vercel.app` (your Vercel URL)

### Alternative: Both on Vercel?

Vercel **can** host serverless Node.js functions, but since this app uses:
- **Socket.io** (persistent WebSocket connections)
- **Long-running processes**

...these don't work well with Vercel's serverless model. **Use Render for the backend.**

---

## 🔧 Environment Variables Reference

### Client (`client/.env`)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend server URL | `http://localhost:5000` (local) or `https://annvaya-server.onrender.com` (production) |

### Server (`server/.env`)
| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/annvaya` |
| `JWT_SECRET` | Secret key for JWT tokens | Any strong random string |
| `PORT` | Server port | `5000` |
| `CLIENT_URL` | Frontend URL (for CORS) | `http://localhost:5173` (local) or `https://your-app.vercel.app` (production) |

---

## ⚠️ Important Notes

- **Never commit `.env` files** — they contain secrets. The `.gitignore` blocks them.
- **`.env.example` files ARE committed** — they show what variables are needed without actual values.
- After deployment, update both `VITE_API_URL` (client) and `CLIENT_URL` (server) with the deployed URLs.
- MongoDB Atlas: Make sure to whitelist `0.0.0.0/0` in Network Access for Render to connect.
