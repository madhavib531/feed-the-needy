import mongoose from 'mongoose';

const donorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['Hotel', 'Hostel', 'Convention Hall', 'Restaurant', 'Other'],
      required: true,
    },
    contact: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      lowercase: true,
    },
    address: {
      type: String,
      trim: true,
    },
    totalDonations: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Donor', donorSchema);
