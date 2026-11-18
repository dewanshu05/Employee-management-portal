const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAttendanceReport,
  getLeaveReport,
  getEmployeeReport,
  getDepartmentReport,
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/dashboard', getDashboardStats);
router.get('/attendance', authorize('admin', 'hr'), getAttendanceReport);
router.get('/leaves', authorize('admin', 'hr'), getLeaveReport);
router.get('/employees', authorize('admin', 'hr'), getEmployeeReport);
router.get('/departments', authorize('admin', 'hr'), getDepartmentReport);

module.exports = router;
