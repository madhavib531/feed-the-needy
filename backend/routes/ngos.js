import express from 'express';
import NGO from '../models/NGO.js';
import { authMiddleware } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

const ngoValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
];

router.get('/', authMiddleware, async (req, res) => {
  try {
    const filter = req.userRole === 'admin' ? {} : { userId: req.userId };
    const ngos = await NGO.find(filter).sort({ createdAt: -1 });
    res.json(ngos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const filter = req.userRole === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, userId: req.userId };

    const ngo = await NGO.findOne(filter);
    if (!ngo) return res.status(404).json({ message: 'NGO not found' });
    res.json(ngo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', authMiddleware, ngoValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const ngo = new NGO({ userId: req.userId, ...req.body });
    await ngo.save();
    res.status(201).json(ngo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/status', authMiddleware, async (req, res) => {
  try {
    const { status, ngoId } = req.body;
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ message: 'Status must be active or inactive' });
    }

    const filter = req.userRole === 'admin'
      ? { _id: ngoId }
      : { userId: req.userId };

    const ngo = await NGO.findOneAndUpdate(
      filter,
      { status },
      { new: true, runValidators: true }
    );

    if (!ngo) return res.status(404).json({ message: 'NGO not found' });
    res.json(ngo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', authMiddleware, ngoValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const filter = req.userRole === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, userId: req.userId };

    const ngo = await NGO.findOneAndUpdate(
      filter,
      req.body,
      { new: true, runValidators: true }
    );
    if (!ngo) return res.status(404).json({ message: 'NGO not found' });
    res.json(ngo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const filter = req.userRole === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, userId: req.userId };

    const ngo = await NGO.findOneAndDelete(filter);
    if (!ngo) return res.status(404).json({ message: 'NGO not found' });
    res.json({ message: 'NGO deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
