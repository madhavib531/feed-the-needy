import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth.js';
import donorRoutes from './routes/donors.js';
import foodRequestRoutes from './routes/foodRequests.js';
import ngoRoutes from './routes/ngos.js';
import careInstitutionRoutes from './routes/careInstitutions.js';
import volunteerRoutes from './routes/volunteers.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/food-donation-app';

mongoose
  .connect(mongoUri)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', authRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/food-requests', foodRequestRoutes);
app.use('/api/food-request', foodRequestRoutes);
app.use('/api/ngos', ngoRoutes);
app.use('/api/ngo', ngoRoutes);
app.use('/api/care-institutions', careInstitutionRoutes);
app.use('/api/care-institution', careInstitutionRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/volunteer', volunteerRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
