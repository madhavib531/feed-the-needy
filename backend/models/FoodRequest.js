import mongoose from 'mongoose';

const foodRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    donor: {
      type: String,
      required: true,
    },
    donorType: {
      type: String,
      required: true,
    },
    meals: {
      type: Number,
      required: true,
      min: 1,
    },
    foodType: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      trim: true,
    },
    pickupBy: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'assigned', 'picked-up', 'delivered'],
      default: 'pending',
    },
    assignedNgo: {
      type: String,
    },
    assignedNGO: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    assignedVolunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    declinedInstitutionIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    declinedNgoIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    recipient: {
      type: String,
    },
    deliveryProgress: {
      type: String,
      trim: true,
    },
    confirmedByInstitution: {
      type: Boolean,
      default: false,
    },
    confirmedAt: {
      type: Date,
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model('FoodRequest', foodRequestSchema);
