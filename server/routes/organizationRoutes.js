const express = require('express');
const router = express.Router();
const {
  registerOrganization,
  getPublicOrganizations,
  getOrganizations,
  approveOrganization,
  rejectOrganization,
  getMasterMetrics,
} = require('../controllers/organizationController');
const { protect, authorize } = require('../middleware/auth');

// Public route to submit organization for approval & fetch active organizations for registration
router.post('/register', registerOrganization);
router.get('/public', getPublicOrganizations);

// Master Platform routes (Master Maker only)
router.use(protect);
router.use(authorize('master'));

router.get('/', getOrganizations);
router.get('/master/metrics', getMasterMetrics);
router.patch('/:id/approve', approveOrganization);
router.patch('/:id/reject', rejectOrganization);

module.exports = router;
