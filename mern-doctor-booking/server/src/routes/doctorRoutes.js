const express = require('express');
const {
  getDoctors,
  getDoctorById,
  updateDoctorProfile,
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.put('/profile/me', protect, authorize('doctor'), updateDoctorProfile);

module.exports = router;
