import mongoose from 'mongoose';

const volunteerSchema = new mongoose.Schema(
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
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      lowercase: true,
    },
    vehicleType: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    skills: [{
      type: String,
      trim: true,
    }],
    availability: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Volunteer', volunteerSchema);
