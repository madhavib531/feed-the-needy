import express from 'express';
import CareInstitution from '../models/CareInstitution.js';
import { authMiddleware } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

const ciValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('type').notEmpty().withMessage('Type is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
];

router.get('/', authMiddleware, async (req, res) => {
  try {
    const institutions = await CareInstitution.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(institutions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const institution = await CareInstitution.findOne({ _id: req.params.id, userId: req.userId });
    if (!institution) return res.status(404).json({ message: 'Institution not found' });
    res.json(institution);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', authMiddleware, ciValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const institution = new CareInstitution({ userId: req.userId, ...req.body });
    await institution.save();
    res.status(201).json(institution);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', authMiddleware, ciValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const institution = await CareInstitution.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!institution) return res.status(404).json({ message: 'Institution not found' });
    res.json(institution);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const institution = await CareInstitution.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!institution) return res.status(404).json({ message: 'Institution not found' });
    res.json({ message: 'Institution deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
