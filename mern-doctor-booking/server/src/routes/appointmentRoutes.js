const express = require('express');
const {
  listAppointments,
  getAppointmentById,
  createAppointment,
  createGuestAppointment,
  updateAppointment,
  deleteAppointment,
  trackAppointment,
  getAllAppointments,
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public
router.post('/track', trackAppointment);
router.post('/guest', createGuestAppointment);

// Protected — standard REST
router.use(protect);

router.get('/', listAppointments);
router.get('/all', authorize('admin'), getAllAppointments);
router.get('/:id', getAppointmentById);
router.post('/', authorize('patient'), createAppointment);
router.put('/:id', updateAppointment);
router.patch('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);

module.exports = router;
