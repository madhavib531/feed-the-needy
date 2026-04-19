# 🚀 Quick Start - MongoDB Version

Get your Food Donation Management App running in 5 minutes!

## 📋 Prerequisites

Install if you don't have them:
- [Node.js](https://nodejs.org/) (v16+)
- [MongoDB](https://www.mongodb.com/try/download/community) (local) **OR** [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free cloud)

---

## ⚡ Quick Setup

### 1️⃣ Backend (1 minute)

```bash
# Go to backend folder
cd backend

# Install packages
npm install

# Create .env file
echo "MONGODB_URI=mongodb://localhost:27017/food-donation-app" > .env
echo "JWT_SECRET=your-secret-key-12345" >> .env
echo "PORT=5000" >> .env

# Start server
npm run dev
```

**Expected output:**
```
MongoDB connected
Server running on http://localhost:5000
```

### 2️⃣ Frontend (1 minute)

Open a **new terminal** and run:

```bash
# Go to project root
cd ..

# Install packages
npm install

# Create .env.local file
echo "VITE_API_URL=http://localhost:5000/api" > .env.local

# Start dev server
npm run dev
```

**Expected output:**
```
  VITE v5.x.x  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### 3️⃣ Test It! (1 minute)

1. Open browser: **http://localhost:5173**
2. Click "Sign up"
3. Enter:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `password123`
4. Click "Sign Up"
5. Go to **Donors** page
6. Click **"Add Donor"** button
7. Fill in donor details
8. Click **"Add Donor"**
9. ✅ Done! Your data is in MongoDB!

---

## 🎯 What to Try

**In Donors Page:**
- ✅ Add a new donor
- ✅ Edit the donor (click Edit button)
- ✅ Delete the donor (click Delete button)
- ✅ Refresh page → data still there!
- ✅ Sign in on different browser → see different data

**New Features:**
- Real MongoDB persistence
- JWT authentication
- User-specific data isolation
- Production-ready backend

---

## 📁 Project Structure

```
Your Project/
├── backend/              # Express API (port 5000)
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── .env             # ← Create this file
│
├── src/                 # React Frontend (port 5173)
│   ├── app/
│   ├── services/api.ts  # API client
│   └── hooks/           # Data fetching
│
└── .env.local          # ← Create this file
```

---

## 🔑 Environment Variables

### Backend (.env)
```env
# MongoDB connection
MONGODB_URI=mongodb://localhost:27017/food-donation-app

# JWT secret (change to random string)
JWT_SECRET=your-super-secret-key-change-this

# Server port
PORT=5000
```

### Frontend (.env.local)
```env
# Backend API URL
VITE_API_URL=http://localhost:5000/api
```

---

## 🛑 Troubleshooting

### "Cannot connect to MongoDB"
```bash
# Make sure MongoDB is running
mongod

# Windows: Should auto-start
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

### "Port 5000 already in use"
```bash
# Find & kill process on port 5000
# Mac/Linux: lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill
# Windows: netstat -ano | findstr :5000
```

### "API requests failing"
- Backend running? Check http://localhost:5000/api/health
- Frontend `.env.local` has `VITE_API_URL`?
- Both servers started? (Backend + Frontend)

### "Can't sign up"
- Password must be at least 6 characters
- Email must be valid
- Check backend console for errors

---

## 📚 Documentation

- **Full Setup:** See [MONGODB_SETUP.md](./MONGODB_SETUP.md)
- **Architecture:** See [MONGODB_README.md](./MONGODB_README.md)
- **API Reference:** See [MONGODB_README.md](./MONGODB_README.md#-api-reference)

---

## 💡 Tips

**Development Workflow:**
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend (new terminal)
npm run dev

# Now you have live reload on both!
```

**MongoDB Atlas (Cloud):**
```bash
# Instead of local MongoDB, use free cloud:
# 1. Create account at https://www.mongodb.com/cloud/atlas
# 2. Create cluster (M0 free tier)
# 3. Create database user
# 4. Get connection string
# 5. Put in backend/.env:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/food-donation-app
```

---

## ✅ Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] MongoDB connected
- [ ] Can sign up with email/password
- [ ] Can add/edit/delete donors
- [ ] Data persists after refresh
- [ ] Different sign-ins show different data

---

## 🎉 You're All Set!

Next steps:
1. Explore the Donors page
2. Try other pages (they're ready for CRUD)
3. Check backend logs for API calls
4. Build more features!

---

**Questions?** Check [MONGODB_SETUP.md](./MONGODB_SETUP.md) for detailed troubleshooting.

Happy coding! 🚀
