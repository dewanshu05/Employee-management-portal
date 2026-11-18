const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  toggleEmployeeStatus,
  approveEmployee,
  rejectEmployee,
  updateLeaveBalance,
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router
  .route('/')
  .get(authorize('admin', 'hr'), getEmployees)
  .post(authorize('admin', 'hr'), createEmployee);

router
  .route('/:id')
  .get(getEmployeeById)
  .put(authorize('admin', 'hr'), updateEmployee)
  .delete(authorize('admin', 'hr'), deleteEmployee);

router.patch('/:id/status', authorize('admin', 'hr'), toggleEmployeeStatus);
router.patch('/:id/approve', authorize('admin', 'hr'), approveEmployee);
router.patch('/:id/reject', authorize('admin', 'hr'), rejectEmployee);
router.put('/:id/leave-balance', authorize('admin', 'hr'), updateLeaveBalance);

module.exports = router;
