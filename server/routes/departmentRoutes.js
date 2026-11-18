const express = require('express');
const router = express.Router();
const {
  getPublicDepartments,
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = require('../controllers/departmentController');
const { protect, authorize } = require('../middleware/auth');

// Public route for onboarding/registration department dropdown
router.get('/public', getPublicDepartments);

router.use(protect);

router
  .route('/')
  .get(getDepartments)
  .post(authorize('admin'), createDepartment);

router
  .route('/:id')
  .get(getDepartmentById)
  .put(authorize('admin'), updateDepartment)
  .delete(authorize('admin'), deleteDepartment);

module.exports = router;
