# MongoDB + Express Setup Guide

This app now uses **MongoDB** (with Node.js/Express backend) instead of Firebase. Follow this guide to get everything running!

## Prerequisites

Make sure you have installed:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (local) OR [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (cloud)

---

## Step 1: Set Up MongoDB

### Option A: Local MongoDB (Recommended for Development)

1. **Install MongoDB Community Edition**
   - Windows: [Download MSI Installer](https://www.mongodb.com/try/download/community)
   - Mac: `brew install mongodb-community`
   - Linux: `sudo apt-get install mongodb`

2. **Start MongoDB Service**
   - Windows: MongoDB should start automatically
   - Mac/Linux: `mongod`

3. **Verify Connection**
   ```bash
   mongo
   ```
   You should see a connection message.

### Option B: MongoDB Atlas (Cloud - Free)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create a cluster (M0 free tier)
4. Create database user (username/password)
5. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/food-donation-app`

---

## Step 2: Backend Setup

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create `.env` file in `backend` folder:

```env
# MongoDB Connection (choose one)
# For local MongoDB:
MONGODB_URI=mongodb://localhost:27017/food-donation-app

# OR for MongoDB Atlas:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/food-donation-app

# JWT Secret (create a strong secret)
JWT_SECRET=your-super-secret-key-change-this

# Server Port
PORT=5000
```

### 3. Start Backend Server

```bash
# Development mode (with auto-reload)
npm run dev

# OR production mode
npm start
```

You should see:
```
MongoDB connected
Server running on http://localhost:5000
```

---

## Step 3: Frontend Setup

### 1. Install Frontend Dependencies

```bash
# From root directory
npm install
# or
pnpm install
```

### 2. Configure Frontend Environment

Create `.env.local` in project root:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Start Frontend Dev Server

```bash
npm run dev
# or
pnpm dev
```

Frontend runs at `http://localhost:5173`

---

## Step 4: Test the Application

### 1. Sign Up

1. Open `http://localhost:5173`
2. Click "Sign up"
3. Enter email, password, name
4. Click "Sign Up"

### 2. Test CRUD Operations

Go to **Donors** page and:
- ✅ Add a new donor
- ✅ Edit the donor
- ✅ Delete the donor
- ✅ Refresh page (data persists!)

---

## 🗄️ Database Structure

MongoDB collections automatically created:

```
food-donation-app (database)
├── users (authentication)
├── donors (food donors)
├── foodrequests (donation requests)
├── ngos (NGO information)
├── careinstitutions (care facilities)
└── volunteers (volunteer data)
```

---

## 📝 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login

### Donors
- `GET /api/donors` - Get all donors
- `POST /api/donors` - Add donor
- `PUT /api/donors/:id` - Update donor
- `DELETE /api/donors/:id` - Delete donor

### Food Requests
- `GET /api/food-requests` - Get all requests
- `POST /api/food-requests` - Create request
- `PUT /api/food-requests/:id` - Update request
- `DELETE /api/food-requests/:id` - Delete request

*(Similar endpoints for NGOs, Care Institutions, Volunteers)*

All endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

---

## 🛠️ Development Workflow

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend
```bash
npm run dev
```

Both will auto-reload on file changes!

---

## 📦 Project Structure

```
Food Donation Management App/
├── backend/                 # Express.js API
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API routes
│   ├── middleware/         # Auth & validation
│   ├── server.js           # Main server file
│   └── package.json
│
├── src/                    # React frontend
│   ├── services/api.ts     # API client
│   ├── context/            # Auth context
│   ├── hooks/              # Data fetching hooks
│   ├── app/                # Pages & components
│   └── main.tsx
│
└── package.json            # Frontend dependencies
```

---

## 🐛 Troubleshooting

### "Cannot connect to MongoDB"
- Local: Make sure `mongod` is running
- Atlas: Check connection string in `.env`
- Firewall: Allow port 27017

### "API request failed"
- Backend running? Check `http://localhost:5000/api/health`
- Frontend `.env.local` configured? Check `VITE_API_URL`
- Restart both frontend & backend

### "Token expired/invalid"
- Clear localStorage: `localStorage.clear()`
- Sign in again

### "Port 5000 already in use"
```bash
# Kill process using port 5000
# Windows: netstat -ano | findstr :5000
# Mac/Linux: lsof -i :5000
```

---

## 🚀 Deploy to Production

### Backend (Heroku Example)
```bash
cd backend
heroku create food-donation-api
git push heroku main
```

### Frontend (Vercel Example)
```bash
npm run build
vercel deploy
```

Set environment variables on hosting platform:
- `VITE_API_URL` → Your backend URL

---

## 📚 Next Steps

1. ✅ Set up MongoDB & backend
2. ✅ Run frontend + backend
3. ✅ Test authentication
4. 🟡 Add CRUD to other pages (Food Requests, NGOs, etc.)
5. 🟡 Add form validations
6. 🟡 Add image uploads
7. 🟡 Deploy to production

---

## Useful Commands

```bash
# Backend
cd backend
npm install              # Install dependencies
npm run dev             # Start dev server
npm start               # Start production server

# Frontend
npm install             # Install dependencies
npm run dev            # Start dev server
npm run build          # Build for production

# MongoDB
mongod                 # Start MongoDB
mongo                  # Connect to MongoDB
```

---

## Support

- [Express.js Docs](https://expressjs.com)
- [MongoDB Docs](https://docs.mongodb.com)
- [Mongoose Docs](https://mongoosejs.com)
- [React Docs](https://react.dev)

Good luck! 🎉
