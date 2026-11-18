const express = require('express');
const router = express.Router();
const {
  checkIn,
  checkOut,
  getTodayAttendance,
  getMyAttendance,
  getAllAttendance,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/checkin', checkIn);
router.put('/checkout', checkOut);
router.get('/today', getTodayAttendance);
router.get('/my', getMyAttendance);

router.get('/', authorize('admin', 'hr'), getAllAttendance);

module.exports = router;
