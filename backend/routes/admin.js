import express from 'express';
import { authMiddleware, requireRoles } from '../middleware/auth.js';
import User from '../models/User.js';
import FoodRequest from '../models/FoodRequest.js';
import CareInstitution from '../models/CareInstitution.js';
import NGO from '../models/NGO.js';

const router = express.Router();

router.use(authMiddleware, requireRoles('admin'));

router.get('/overview', async (req, res) => {
  try {
    const [usersByRole, requestsByStatus, unassignedCount, careInstitutionCount, activeNgoCount, recentRequests] = await Promise.all([
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]),
      FoodRequest.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      FoodRequest.countDocuments({
        $or: [
          { assignedNGO: { $exists: false } },
          { assignedNGO: null },
          { assignedVolunteer: { $exists: false } },
          { assignedVolunteer: null },
          { institutionId: { $exists: false } },
          { institutionId: null },
        ],
      }),
      CareInstitution.countDocuments(),
      NGO.countDocuments({ status: 'active' }),
      FoodRequest.find()
        .sort({ updatedAt: -1 })
        .limit(8)
        .select('donor meals foodType status createdAt updatedAt'),
    ]);

    const roleCounts = {
      admin: 0,
      donor: 0,
      ngo: 0,
      volunteer: 0,
      institution: 0,
    };

    for (const roleItem of usersByRole) {
      if (roleItem?._id && Object.prototype.hasOwnProperty.call(roleCounts, roleItem._id)) {
        roleCounts[roleItem._id] = roleItem.count;
      }
    }

    // Dashboard "Care Institutions" should reflect institution records, not user accounts.
    roleCounts.institution = careInstitutionCount;
    roleCounts.ngo = activeNgoCount;

    const statusCounts = {
      pending: 0,
      assigned: 0,
      'picked-up': 0,
      delivered: 0,
    };

    for (const statusItem of requestsByStatus) {
      if (statusItem?._id && Object.prototype.hasOwnProperty.call(statusCounts, statusItem._id)) {
        statusCounts[statusItem._id] = statusItem.count;
      }
    }

    const recentActivity = recentRequests.map((request) => {
      const activityType = request.status === 'delivered' ? 'delivery' : 'request';
      const timestamp = request.updatedAt || request.createdAt;

      return {
        id: request._id,
        type: activityType,
        message: `${request.donor} - ${request.meals} meals (${request.foodType})`,
        status: request.status,
        timestamp,
      };
    });

    res.json({ roleCounts, statusCounts, unassignedCount, recentActivity });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/automation/connect-all', async (req, res) => {
  try {
    const [ngos, volunteers, institutions, unassignedRequests] = await Promise.all([
      User.find({ role: 'ngo' }).select('_id'),
      User.find({ role: 'volunteer' }).select('_id'),
      User.find({ role: 'institution' }).select('_id'),
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
        .select('_id status assignedNGO assignedNgo assignedVolunteer institutionId'),
    ]);

    if (!ngos.length || !volunteers.length || !institutions.length) {
      return res.status(400).json({
        message: 'Automation requires at least one NGO, volunteer, and institution user',
      });
    }

    let ngoIndex = 0;
    let volunteerIndex = 0;
    let institutionIndex = 0;

    const updateOps = [];

    for (const request of unassignedRequests) {
      const update = {};

      if (!request.assignedNGO) {
        const ngoId = ngos[ngoIndex % ngos.length]._id;
        ngoIndex += 1;
        update.assignedNGO = ngoId;
        update.assignedNgo = String(ngoId);
      }

      if (!request.assignedVolunteer) {
        const volunteerId = volunteers[volunteerIndex % volunteers.length]._id;
        volunteerIndex += 1;
        update.assignedVolunteer = volunteerId;
      }

      if (!request.institutionId) {
        const institutionId = institutions[institutionIndex % institutions.length]._id;
        institutionIndex += 1;
        update.institutionId = institutionId;
      }

      if (Object.keys(update).length > 0) {
        if (request.status === 'pending') {
          update.status = 'assigned';
        }

        updateOps.push({
          updateOne: {
            filter: { _id: request._id },
            update: { $set: update },
          },
        });
      }
    }

    if (!updateOps.length) {
      return res.json({ message: 'No requests needed automation updates', updated: 0 });
    }

    const result = await FoodRequest.bulkWrite(updateOps);
    res.json({
      message: 'Automation completed successfully',
      updated: result.modifiedCount || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
