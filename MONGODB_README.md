# Food Donation Management App - MongoDB Version

A full-stack web application for managing food donations with a **React frontend** and **Node.js/Express backend** powered by **MongoDB**.

## ✨ Features

### Core Functionality
- 🔐 **User Authentication** - Secure signup/login with JWT
- 👥 **Donor Management** - Add, edit, delete donors
- 📦 **Food Requests** - Track donation requests with status
- 🏢 **Care Institutions** - Manage orphanages, old age homes
- ❤️ **NGO Management** - Handle non-profit organizations
- 👤 **Volunteer Tracking** - Manage volunteer network
- 🎯 **Smart Matching** - AI-powered route optimization
- 👨‍👩‍👧 **Neighbor Sharing** - Peer-to-peer donation system
- 📍 **Pickup Points** - Fixed collection locations

### Technical Features
- ✅ Real-time data synchronization
- ✅ Form validation & error handling
- ✅ User-specific data isolation
- ✅ Responsive UI with Tailwind CSS
- ✅ RESTful API architecture
- ✅ JWT-based authentication
- ✅ MongoDB data persistence

---

## 🏗️ Architecture

```
┌─────────────────────────────────┐
│   React Frontend (Vite)         │
│  - Pages & Components           │
│  - Context API (Auth)           │
│  - Custom Hooks (Data Fetching) │
│  - Tailwind CSS + shadcn UI     │
└────────────┬────────────────────┘
             │ (REST API calls)
             ▼
┌─────────────────────────────────┐
│   Express.js Backend            │
│  - RESTful API Routes           │
│  - JWT Authentication           │
│  - Input Validation             │
│  - Business Logic               │
└────────────┬────────────────────┘
             │ (Queries & Updates)
             ▼
┌─────────────────────────────────┐
│   MongoDB Database              │
│  - Collections (Documents)      │
│  - Indexes & Queries            │
│  - User Data Isolation          │
└─────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- MongoDB (local or Atlas)
- npm or pnpm

### Installation

**1. Clone & Install**
```bash
npm install
cd backend && npm install && cd ..
```

**2. Configure Environment**
```bash
# Backend
echo "MONGODB_URI=mongodb://localhost:27017/food-donation-app" > backend/.env
echo "JWT_SECRET=your-secret-key" >> backend/.env
echo "PORT=5000" >> backend/.env

# Frontend
echo "VITE_API_URL=http://localhost:5000/api" > .env.local
```

**3. Start Servers**
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
npm run dev
```

**4. Access Application**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- API Docs: http://localhost:5000/api/health

---

## 📁 Project Structure

```
food-donation-app/
│
├── backend/                      # Express.js API
│   ├── models/                   # Mongoose schemas
│   │   ├── User.js              # User authentication
│   │   ├── Donor.js             # Donor data
│   │   ├── FoodRequest.js       # Food requests
│   │   ├── NGO.js               # NGO information
│   │   ├── CareInstitution.js   # Care facilities
│   │   └── Volunteer.js         # Volunteer data
│   ├── routes/                   # API endpoints
│   │   ├── auth.js              # Auth endpoints
│   │   ├── donors.js            # Donor CRUD
│   │   ├── foodRequests.js      # Request CRUD
│   │   ├── ngos.js              # NGO CRUD
│   │   ├── careInstitutions.js  # Institution CRUD
│   │   └── volunteers.js        # Volunteer CRUD
│   ├── middleware/
│   │   └── auth.js              # JWT validation
│   ├── server.js                # Express app
│   ├── package.json
│   └── .env
│
├── src/                         # React frontend
│   ├── services/
│   │   └── api.ts               # API client (Axios)
│   ├── context/
│   │   └── AuthContext.tsx      # Auth state management
│   ├── hooks/
│   │   ├── useDonors.ts         # Donor CRUD hook
│   │   ├── useFoodRequests.ts   # Request CRUD hook
│   │   └── useEntities.ts       # Generic entity hook
│   ├── app/
│   │   ├── pages/               # Page components
│   │   ├── components/          # Reusable components
│   │   ├── App.tsx              # Root component
│   │   └── routes.tsx           # Route configuration
│   └── main.tsx
│
├── MONGODB_SETUP.md             # MongoDB setup guide
├── package.json                 # Frontend dependencies
└── .env.local                   # Frontend env vars
```

---

## 🔌 API Reference

### Authentication

**Sign Up**
```bash
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123"
}

Response:
{
  "token": "jwt-token-here",
  "user": { "id": "...", "name": "...", "email": "..." }
}
```

**Login**
```bash
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "securepass123"
}
```

### Donors (Pattern for all CRUD endpoints)

**Get All Donors**
```bash
GET /api/donors
Authorization: Bearer <token>
```

**Create Donor**
```bash
POST /api/donors
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Grand Hotel",
  "type": "Hotel",
  "contact": "Manager Name",
  "phone": "+1234567890",
  "address": "123 Main St",
  "totalDonations": 0,
  "status": "active"
}
```

**Update Donor**
```bash
PUT /api/donors/:id
Authorization: Bearer <token>
```

**Delete Donor**
```bash
DELETE /api/donors/:id
Authorization: Bearer <token>
```

*(Similar patterns for /api/food-requests, /api/ngos, /api/care-institutions, /api/volunteers)*

---

## 🔐 Security

- **Passwords**: Hashed with bcryptjs
- **Authentication**: JWT tokens (7-day expiry)
- **Authorization**: User-specific data isolation
- **Validation**: Express-validator for inputs
- **CORS**: Enabled for frontend origin

---

## 📊 Data Models

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  role: String (admin|donor|ngo|volunteer),
  createdAt: Date
}
```

### Donor
```javascript
{
  userId: ObjectId,
  name: String,
  type: String (Hotel|Hostel|Convention Hall|Restaurant|Other),
  contact: String,
  phone: String,
  email: String,
  address: String,
  totalDonations: Number,
  status: String (active|inactive),
  createdAt: Date
}
```

*(See backend/models/* for complete schemas)*

---

## 🛠️ Development

### Adding New Page/Entity

1. **Create API Route** in `backend/routes/newentity.js`
2. **Create Model** in `backend/models/NewEntity.js`
3. **Create Hook** in `src/hooks/useNewEntity.ts`
4. **Create Page** in `src/app/pages/NewEntity.tsx`
5. **Add Route** in `src/app/routes.tsx`
6. **Add Navigation** in `src/app/components/Layout.tsx`

### Running Tests

```bash
# Backend tests (coming soon)
cd backend && npm test

# Frontend tests (coming soon)
npm test
```

---

## 🚀 Deployment

### Backend (Heroku)
```bash
cd backend
heroku create food-donation-api
# Add environment variables
git push heroku main
```

### Frontend (Vercel)
```bash
npm run build
vercel deploy
```

### MongoDB Atlas
- Free tier: 512MB storage
- Production tier: Flexible scaling
- Connection string in backend `.env`

---

## 📦 Tech Stack

**Frontend**
- React 18
- TypeScript
- Vite (build tool)
- React Router 7
- Tailwind CSS
- Axios (HTTP client)
- Lucide React (icons)

**Backend**
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT (authentication)
- bcryptjs (password hashing)
- express-validator (validation)

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check MongoDB is running
mongod

# Check environment variables
cat backend/.env

# Clear node_modules and reinstall
rm -rf backend/node_modules
cd backend && npm install
```

### Frontend can't reach API
- Verify backend is running on port 5000
- Check `VITE_API_URL` in `.env.local`
- Look at browser console for CORS errors

### Authentication failing
- Ensure JWT_SECRET is set in backend `.env`
- Check token isn't expired (7 days)
- Clear browser localStorage if issues persist

---

## 📚 Learning Resources

- [Express.js Tutorial](https://expressjs.com/en/starter/basic-routing.html)
- [MongoDB University](https://learn.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [React Hooks](https://react.dev/reference/react)
- [JWT Authentication](https://jwt.io/)

---

## 🎯 Roadmap

- [x] User authentication
- [x] Donor CRUD
- [ ] Food Request CRUD
- [ ] NGO management
- [ ] Care Institution management
- [ ] Volunteer management
- [ ] Advanced search & filtering
- [ ] Image uploads
- [ ] Email notifications
- [ ] Analytics dashboard
- [ ] Mobile app
- [ ] Docker deployment

---

## 📄 License

This project is open source. Use freely for educational & non-commercial purposes.

---

## 💬 Questions?

See [MONGODB_SETUP.md](./MONGODB_SETUP.md) for detailed setup instructions.

Happy coding! 🚀
