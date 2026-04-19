import express from 'express';
import Donor from '../models/Donor.js';
import { authMiddleware } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Validation rules
const donorValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('type').notEmpty().withMessage('Type is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
];

// Get all donors for current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const donors = await Donor.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(donors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single donor
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const donor = await Donor.findOne({ _id: req.params.id, userId: req.userId });
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }
    res.json(donor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create donor
router.post('/', authMiddleware, donorValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const donor = new Donor({
      userId: req.userId,
      ...req.body,
    });

    await donor.save();
    res.status(201).json(donor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update donor
router.put('/:id', authMiddleware, donorValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const donor = await Donor.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    res.json(donor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete donor
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const donor = await Donor.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    res.json({ message: 'Donor deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
