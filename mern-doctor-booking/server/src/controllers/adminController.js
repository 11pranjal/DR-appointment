const User = require('../models/User');
const Appointment = require('../models/Appointment');
const asyncHandler = require('../utils/asyncHandler');

// @route   GET /api/admin/stats
exports.getStats = asyncHandler(async (req, res) => {
  const [doctors, patients, appointments, pending, deletionRequests] = await Promise.all([
    User.countDocuments({ role: 'doctor' }),
    User.countDocuments({ role: 'patient' }),
    Appointment.countDocuments(),
    Appointment.countDocuments({ status: 'pending' }),
    User.countDocuments({ deletionRequested: true }),
  ]);

  res.json({
    success: true,
    data: { doctors, patients, appointments, pendingAppointments: pending, deletionRequests },
  });
});
