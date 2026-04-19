import express from 'express';
import FoodRequest from '../models/FoodRequest.js';
import User from '../models/User.js';
import { authMiddleware, requireRoles } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

async function autoAssignUnassignedRequests() {
  const [ngos, volunteers, institutions, unassignedRequests] = await Promise.all([
    User.find({ role: 'ngo' }).select('_id'),
    User.find({ role: 'volunteer' }).select('_id'),
    User.find({ role: 'institution' }).select('_id name'),
    FoodRequest.find({
      status: 'pending',
      $or: [
        { assignedNGO: { $exists: false } },
        { assignedNGO: null },
        { assignedVolunteer: { $exists: false } },
        { assignedVolunteer: null },
        { institutionId: { $exists: false } },
        { institutionId: null },
      ],
    })
      .sort({ createdAt: 1 })
      .select('_id status assignedNGO assignedVolunteer institutionId'),
  ]);

  if (!ngos.length || !volunteers.length || !institutions.length || !unassignedRequests.length) {
    return;
  }

  let ngoIndex = 0;
  let volunteerIndex = 0;
  let institutionIndex = 0;

  const updateOps = [];

  for (const request of unassignedRequests) {
    const ngo = ngos[ngoIndex % ngos.length];
    const volunteer = volunteers[volunteerIndex % volunteers.length];
    const institution = institutions[institutionIndex % institutions.length];

    ngoIndex += 1;
    volunteerIndex += 1;
    institutionIndex += 1;

    const update = {};

    if (!request.assignedNGO) {
      update.assignedNGO = ngo._id;
      update.assignedNgo = String(ngo._id);
    }

    if (!request.assignedVolunteer) {
      update.assignedVolunteer = volunteer._id;
    }

    if (!request.institutionId) {
      update.institutionId = institution._id;
      update.recipient = institution.name;
    }

    if (Object.keys(update).length === 0) {
      continue;
    }

    updateOps.push({
      updateOne: {
        filter: { _id: request._id },
        update: {
          $set: update,
        },
      },
    });
  }

  if (updateOps.length) {
    await FoodRequest.bulkWrite(updateOps);
  }
}

const foodRequestValidation = [
  body('donor').notEmpty().withMessage('Donor is required'),
  body('donorType').notEmpty().withMessage('Donor type is required'),
  body('meals').isInt({ min: 1 }).withMessage('Meals must be at least 1'),
  body('foodType').notEmpty().withMessage('Food type is required'),
  body('location').optional({ checkFalsy: true }).isString().withMessage('Location must be a string'),
  body('pickupBy').notEmpty().withMessage('Pickup time is required'),
];

function buildScopedFilter(req) {
  const { userRole, userId } = req;
  const query = req.query || {};

  // Admin can inspect all records and optionally filter with query params.
  if (userRole === 'admin') {
    const filter = {};
    if (query.userId) filter.userId = query.userId;
    if (query.assignedNGO) filter.assignedNGO = query.assignedNGO;
    if (query.assignedVolunteer) filter.assignedVolunteer = query.assignedVolunteer;
    if (query.institutionId) filter.institutionId = query.institutionId;
    if (query.status) filter.status = query.status;
    return filter;
  }

  if (userRole === 'donor') {
    return { userId: query.userId || userId };
  }

  if (userRole === 'ngo') {
    const wantsInstitutionAcceptedQueue =
      query.deliveryProgress === 'institution-accepted-awaiting-ngo' ||
      (query.institutionStatus === 'accepted' && String(query.assignedNGO).toLowerCase() === 'null');

    if (wantsInstitutionAcceptedQueue) {
      return {
        institutionId: { $exists: true, $ne: null },
        status: 'assigned',
        confirmedByInstitution: { $ne: true },
        $and: [
          {
            $or: [
              { assignedNGO: { $exists: false } },
              { assignedNGO: null },
              { assignedNgo: { $exists: false } },
              { assignedNgo: null },
            ],
          },
          {
            $or: [
              { deliveryProgress: 'institution-accepted-awaiting-ngo' },
              { deliveryProgress: { $exists: false } },
              { deliveryProgress: null },
            ],
          },
        ],
        declinedNgoIds: { $ne: userId },
      };
    }

    if (query.assignedNGO) {
      return {
        $or: [{ assignedNGO: query.assignedNGO }, { assignedNgo: query.assignedNGO }],
      };
    }

    return {
      $or: [
        { assignedNGO: userId },
        { assignedNgo: userId },
        {
          institutionId: { $exists: true, $ne: null },
          status: 'assigned',
          confirmedByInstitution: { $ne: true },
          $or: [
            { assignedNGO: { $exists: false } },
            { assignedNGO: null },
            { assignedNgo: { $exists: false } },
            { assignedNgo: null },
          ],
          confirmedByInstitution: { $ne: true },
          declinedNgoIds: { $ne: userId },
        },
      ],
    };
  }

  if (userRole === 'volunteer') {
    return { assignedVolunteer: userId };
  }

  if (userRole === 'institution') {
    return {
      $or: [
        { institutionId: userId },
        {
          status: 'pending',
          $or: [{ institutionId: { $exists: false } }, { institutionId: null }],
          declinedInstitutionIds: { $ne: userId },
        },
      ],
    };
  }

  return { userId };
}

router.get('/', authMiddleware, async (req, res) => {
  try {
    if (req.query?.userId && req.userRole !== 'admin' && req.query.userId !== req.userId) {
      return res.status(403).json({ message: 'Cannot access another user\'s donations' });
    }

    const requests = await FoodRequest.find(buildScopedFilter(req)).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/assigned-deliveries', authMiddleware, requireRoles('volunteer', 'admin'), async (req, res) => {
  try {
    const requestedVolunteerId = req.query?.volunteerId;

    if (req.userRole !== 'admin' && requestedVolunteerId && requestedVolunteerId !== req.userId) {
      return res.status(403).json({ message: 'Cannot access another volunteer\'s deliveries' });
    }

    const volunteerId = requestedVolunteerId || req.userId;
    const filter = req.userRole === 'admin' ? { assignedVolunteer: volunteerId } : { assignedVolunteer: req.userId };

    const deliveries = await FoodRequest.find(filter).sort({ updatedAt: -1 });
    res.json(deliveries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/incoming-deliveries', authMiddleware, requireRoles('institution', 'admin'), async (req, res) => {
  try {
    const requestedInstitutionId = req.query?.institutionId;

    if (req.userRole !== 'admin' && requestedInstitutionId && requestedInstitutionId !== req.userId) {
      return res.status(403).json({ message: 'Cannot access another institution\'s deliveries' });
    }

    const institutionId = requestedInstitutionId || req.userId;
    const filter = req.userRole === 'admin' ? { institutionId } : { institutionId: req.userId };

    const deliveries = await FoodRequest.find(filter).sort({ updatedAt: -1 });
    res.json(deliveries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/delivery/:id/status', authMiddleware, requireRoles('volunteer', 'admin', 'ngo', 'institution'), async (req, res) => {
  try {
    const { status, deliveryProgress } = req.body;
    const update = {};

    if (status) update.status = status;
    if (deliveryProgress) update.deliveryProgress = deliveryProgress;

    const scope = req.userRole === 'admin' ? {} : buildScopedFilter(req);
    const delivery = await FoodRequest.findOneAndUpdate(
      { _id: req.params.id, ...scope },
      update,
      { new: true, runValidators: true }
    );

    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    res.json(delivery);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/delivery/:id/confirm', authMiddleware, requireRoles('institution', 'admin'), async (req, res) => {
  try {
    const filter = req.userRole === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, institutionId: req.userId };

    const updated = await FoodRequest.findOneAndUpdate(
      filter,
      {
        status: 'delivered',
        confirmedByInstitution: true,
        confirmedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const filter = { _id: req.params.id, ...buildScopedFilter(req) };
    const request = await FoodRequest.findOne(filter);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', authMiddleware, foodRequestValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const foodRequest = new FoodRequest({
      userId: req.userId,
      ...req.body,
    });

    await foodRequest.save();
    await autoAssignUnassignedRequests();

    const latestRequest = await FoodRequest.findById(foodRequest._id);
    res.status(201).json(latestRequest || foodRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', authMiddleware, foodRequestValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const filter = req.userRole === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, userId: req.userId };

    const foodRequest = await FoodRequest.findOneAndUpdate(filter, req.body, { new: true, runValidators: true });

    if (!foodRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json(foodRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/:id', authMiddleware, requireRoles('admin', 'ngo'), async (req, res) => {
  try {
    const { assignedNGO, status, deliveryProgress, assignedVolunteer, institutionId } = req.body;
    const update = {};

    if (assignedNGO !== undefined) {
      update.assignedNGO = assignedNGO;
      update.assignedNgo = assignedNGO ? String(assignedNGO) : null;
    }
    if (status !== undefined) update.status = status;
    if (deliveryProgress !== undefined) update.deliveryProgress = deliveryProgress;
    if (assignedVolunteer !== undefined) update.assignedVolunteer = assignedVolunteer;
    if (institutionId !== undefined) update.institutionId = institutionId;

    if (req.userRole === 'ngo') {
      update.assignedNGO = req.userId;
      update.assignedNgo = req.userId;
    }

    const roleScope = req.userRole === 'admin' ? {} : buildScopedFilter(req);
    const foodRequest = await FoodRequest.findOneAndUpdate(
      { _id: req.params.id, ...roleScope },
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!foodRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json(foodRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch(
  '/:id/status',
  authMiddleware,
  requireRoles('admin', 'ngo', 'volunteer', 'institution'),
  async (req, res) => {
    try {
      const { status, assignedNGO, assignedVolunteer, institutionId, deliveryProgress } = req.body;
      const update = {};

      if (status) update.status = status;
      if (deliveryProgress) update.deliveryProgress = deliveryProgress;

      if (assignedNGO) {
        update.assignedNGO = assignedNGO;
        update.assignedNgo = assignedNGO;
      }
      if (assignedVolunteer) update.assignedVolunteer = assignedVolunteer;
      if (institutionId) update.institutionId = institutionId;

      if (req.userRole === 'ngo') {
        update.assignedNGO = req.userId;
        update.assignedNgo = req.userId;
      }

      const roleScope = req.userRole === 'admin' ? {} : buildScopedFilter(req);
      const foodRequest = await FoodRequest.findOneAndUpdate(
        { _id: req.params.id, ...roleScope },
        update,
        { new: true, runValidators: true }
      );

      if (!foodRequest) {
        return res.status(404).json({ message: 'Request not found' });
      }

      res.json(foodRequest);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.patch('/:id/institution-response', authMiddleware, requireRoles('institution', 'admin'), async (req, res) => {
  try {
    const { action } = req.body;

    if (!['accept', 'decline'].includes(action)) {
      return res.status(400).json({ message: 'action must be accept or decline' });
    }

    const institutionUserId = req.userRole === 'admin' ? req.body?.institutionId : req.userId;
    if (!institutionUserId) {
      return res.status(400).json({ message: 'institutionId is required' });
    }

    if (action === 'decline') {
      const declined = await FoodRequest.findOneAndUpdate(
        {
          _id: req.params.id,
          status: 'pending',
          $or: [{ institutionId: { $exists: false } }, { institutionId: null }],
        },
        { $addToSet: { declinedInstitutionIds: institutionUserId } },
        { new: true }
      );

      if (!declined) {
        return res.status(409).json({ message: 'Request is no longer available' });
      }

      return res.json({ message: 'Request declined', request: declined });
    }

    const institutionUser = await User.findById(institutionUserId).select('name role');
    if (!institutionUser || institutionUser.role !== 'institution') {
      return res.status(404).json({ message: 'Institution user not found' });
    }

    // First institution to accept claims the request.
    const accepted = await FoodRequest.findOneAndUpdate(
      {
        _id: req.params.id,
        status: 'pending',
        $or: [{ institutionId: { $exists: false } }, { institutionId: null }],
      },
      {
        $set: {
          institutionId: institutionUserId,
          recipient: institutionUser.name,
          status: 'assigned',
          deliveryProgress: 'institution-accepted-awaiting-ngo',
          assignedNGO: null,
          assignedNgo: null,
          assignedVolunteer: null,
        },
      },
      { new: true, runValidators: true }
    );

    if (!accepted) {
      return res.status(409).json({ message: 'Request already accepted by another institution' });
    }

    res.json(accepted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/:id/ngo-delivery-response', authMiddleware, requireRoles('ngo', 'admin'), async (req, res) => {
  try {
    const { action } = req.body;

    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'action must be accept or reject' });
    }

    if (action === 'accept') {
      const ngoUserId = req.userRole === 'admin' ? req.body?.ngoId : req.userId;
      if (!ngoUserId) {
        return res.status(400).json({ message: 'ngoId is required' });
      }

      const accepted = await FoodRequest.findOneAndUpdate(
        {
          _id: req.params.id,
          institutionId: { $exists: true, $ne: null },
          status: 'assigned',
          confirmedByInstitution: { $ne: true },
          declinedNgoIds: { $ne: ngoUserId },
          $and: [
            {
              $or: [
                { assignedNGO: { $exists: false } },
                { assignedNGO: null },
                { assignedNgo: { $exists: false } },
                { assignedNgo: null },
              ],
            },
            {
              $or: [
                { deliveryProgress: 'institution-accepted-awaiting-ngo' },
                { deliveryProgress: { $exists: false } },
                { deliveryProgress: null },
              ],
            },
          ],
        },
        {
          $set: {
            assignedNGO: ngoUserId,
            assignedNgo: String(ngoUserId),
            deliveryProgress: 'ngo-accepted-for-delivery',
            status: 'assigned',
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!accepted) {
        return res.status(409).json({ message: 'Request is no longer available for NGO acceptance' });
      }

      return res.json(accepted);
    }

    const ngoUserId = req.userRole === 'admin' ? req.body?.ngoId : req.userId;
    if (!ngoUserId) {
      return res.status(400).json({ message: 'ngoId is required' });
    }

    const rejected = await FoodRequest.findOneAndUpdate(
      {
        _id: req.params.id,
        institutionId: { $exists: true, $ne: null },
        status: 'assigned',
        confirmedByInstitution: { $ne: true },
        $and: [
          {
            $or: [
              { assignedNGO: { $exists: false } },
              { assignedNGO: null },
              { assignedNgo: { $exists: false } },
              { assignedNgo: null },
            ],
          },
          {
            $or: [
              { deliveryProgress: 'institution-accepted-awaiting-ngo' },
              { deliveryProgress: { $exists: false } },
              { deliveryProgress: null },
            ],
          },
        ],
      },
      {
        $addToSet: { declinedNgoIds: ngoUserId },
        $set: {
          assignedNGO: null,
          assignedNgo: null,
          status: 'assigned',
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!rejected) {
      return res.status(409).json({ message: 'Request is no longer available for NGO response' });
    }

    return res.json(rejected);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get('/assigned-deliveries/list', authMiddleware, requireRoles('volunteer', 'admin'), async (req, res) => {
  try {
    const filter = req.userRole === 'admin' ? {} : { assignedVolunteer: req.userId };
    const deliveries = await FoodRequest.find(filter).sort({ updatedAt: -1 });
    res.json(deliveries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/incoming-deliveries/list', authMiddleware, requireRoles('institution', 'admin'), async (req, res) => {
  try {
    const filter = req.userRole === 'admin' ? {} : { institutionId: req.userId };
    const deliveries = await FoodRequest.find(filter).sort({ updatedAt: -1 });
    res.json(deliveries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/delivery/confirm/:id', authMiddleware, requireRoles('institution', 'admin'), async (req, res) => {
  try {
    const filter = req.userRole === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, institutionId: req.userId };

    const updated = await FoodRequest.findOneAndUpdate(
      filter,
      {
        status: 'delivered',
        confirmedByInstitution: true,
        confirmedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/delivery/confirm', authMiddleware, requireRoles('institution', 'admin'), async (req, res) => {
  req.params.id = req.body.id;
  if (!req.params.id) {
    return res.status(400).json({ message: 'id is required' });
  }

  try {
    const filter = req.userRole === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, institutionId: req.userId };

    const updated = await FoodRequest.findOneAndUpdate(
      filter,
      {
        status: 'delivered',
        confirmedByInstitution: true,
        confirmedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const foodRequest = await FoodRequest.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    if (!foodRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
