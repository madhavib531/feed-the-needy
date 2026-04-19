import express from 'express';
import Volunteer from '../models/Volunteer.js';
import { authMiddleware } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

const volunteerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
];

router.get('/', authMiddleware, async (req, res) => {
  try {
    const volunteers = await Volunteer.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(volunteers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const volunteer = await Volunteer.findOne({ _id: req.params.id, userId: req.userId });
    if (!volunteer) return res.status(404).json({ message: 'Volunteer not found' });
    res.json(volunteer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', authMiddleware, volunteerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const volunteer = new Volunteer({ userId: req.userId, ...req.body });
    await volunteer.save();
    res.status(201).json(volunteer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/status', authMiddleware, async (req, res) => {
  try {
    const { availability, status } = req.body;

    const update = {};
    if (availability !== undefined) update.availability = availability;
    if (status !== undefined) update.status = status;

    const volunteer = await Volunteer.findOneAndUpdate(
      { userId: req.userId },
      update,
      { new: true }
    );

    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer profile not found. Create profile first.' });
    }

    res.json(volunteer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', authMiddleware, volunteerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const volunteer = await Volunteer.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!volunteer) return res.status(404).json({ message: 'Volunteer not found' });
    res.json(volunteer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const volunteer = await Volunteer.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!volunteer) return res.status(404).json({ message: 'Volunteer not found' });
    res.json({ message: 'Volunteer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
