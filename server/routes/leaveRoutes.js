const express = require('express');
const router = express.Router();
const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  approveLeave,
  rejectLeave,
  cancelLeave,
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/', applyLeave);
router.get('/my', getMyLeaves);
router.put('/:id/cancel', cancelLeave);

router.get('/', authorize('admin', 'hr'), getAllLeaves);
router.put('/:id/approve', authorize('admin', 'hr'), approveLeave);
router.put('/:id/reject', authorize('admin', 'hr'), rejectLeave);

module.exports = router;
