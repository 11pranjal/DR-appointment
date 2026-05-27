const Appointment = require('../models/Appointment');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const populateAppointment = { path: 'doctor patient', select: '-password' };

const canAccessAppointment = (user, appointment) => {
  if (user.role === 'admin') return true;
  if (user.role === 'doctor' && String(appointment.doctor) === String(user._id)) return true;
  if (user.role === 'patient' && appointment.patient && String(appointment.patient) === String(user._id))
    return true;
  return false;
};

// GET /api/appointments — list (role-based CRUD: Read many)
exports.listAppointments = asyncHandler(async (req, res) => {
  let filter = {};
  if (req.user.role === 'doctor') filter = { doctor: req.user._id };
  else if (req.user.role === 'patient') filter = { patient: req.user._id };

  const list = await Appointment.find(filter)
    .populate(populateAppointment)
    .sort({ createdAt: -1 });
  res.json({ success: true, count: list.length, data: list });
});

// GET /api/appointments/:id — Read one
exports.getAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id).populate(populateAppointment);
  if (!appointment) {
    const err = new Error('Appointment not found');
    err.statusCode = 404;
    throw err;
  }
  if (!canAccessAppointment(req.user, appointment)) {
    const err = new Error('Not allowed');
    err.statusCode = 403;
    throw err;
  }
  res.json({ success: true, data: appointment });
});

// POST /api/appointments — Create (patient)
exports.createAppointment = asyncHandler(async (req, res) => {
  const { doctorId, scheduleDate, scheduleTime, reason } = req.body;

  const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
  if (!doctor) {
    const err = new Error('Doctor not found');
    err.statusCode = 404;
    throw err;
  }

  const appointment = await Appointment.create({
    doctor: doctorId,
    patient: req.user._id,
    scheduleDate,
    scheduleTime,
    reason,
  });

  const populated = await appointment.populate(populateAppointment);
  res.status(201).json({ success: true, data: populated });
});

// POST /api/appointments/guest — Create without account
exports.createGuestAppointment = asyncHandler(async (req, res) => {
  const { doctorId, guestName, guestEmail, guestPhone, scheduleDate, scheduleTime, reason } =
    req.body;

  const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
  if (!doctor) {
    const err = new Error('Doctor not found');
    err.statusCode = 404;
    throw err;
  }

  const appointment = await Appointment.create({
    doctor: doctorId,
    guestName,
    guestEmail,
    guestPhone,
    scheduleDate,
    scheduleTime,
    reason,
  });

  const populated = await appointment.populate(populateAppointment);
  res.status(201).json({ success: true, data: populated });
});

// PUT /api/appointments/:id — Update (full/partial fields)
exports.updateAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    const err = new Error('Appointment not found');
    err.statusCode = 404;
    throw err;
  }

  const isDoctor = req.user.role === 'doctor' && String(appointment.doctor) === String(req.user._id);
  const isAdmin = req.user.role === 'admin';
  const isPatient =
    req.user.role === 'patient' &&
    appointment.patient &&
    String(appointment.patient) === String(req.user._id);

  if (!isDoctor && !isAdmin && !isPatient) {
    const err = new Error('Not allowed to update this appointment');
    err.statusCode = 403;
    throw err;
  }

  const { scheduleDate, scheduleTime, reason, status, paymentStatus, notes } = req.body;

  if (isPatient && appointment.status !== 'pending') {
    const err = new Error('Can only edit pending appointments');
    err.statusCode = 400;
    throw err;
  }

  if (scheduleDate !== undefined) appointment.scheduleDate = scheduleDate;
  if (scheduleTime !== undefined) appointment.scheduleTime = scheduleTime;
  if (reason !== undefined) appointment.reason = reason;
  if (notes !== undefined) appointment.notes = notes;

  if (status !== undefined && (isDoctor || isAdmin)) appointment.status = status;
  if (paymentStatus !== undefined && (isDoctor || isAdmin)) appointment.paymentStatus = paymentStatus;

  await appointment.save();
  const populated = await appointment.populate(populateAppointment);
  res.json({ success: true, data: populated });
});

// DELETE /api/appointments/:id
exports.deleteAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    const err = new Error('Appointment not found');
    err.statusCode = 404;
    throw err;
  }

  const isAdmin = req.user.role === 'admin';
  const isPatient =
    req.user.role === 'patient' &&
    appointment.patient &&
    String(appointment.patient) === String(req.user._id) &&
    appointment.status === 'pending';

  if (!isAdmin && !isPatient) {
    const err = new Error('Not allowed to delete this appointment');
    err.statusCode = 403;
    throw err;
  }

  await appointment.deleteOne();
  res.json({ success: true, message: 'Appointment deleted' });
});

// POST /api/appointments/track — public
exports.trackAppointment = asyncHandler(async (req, res) => {
  const { trackingId } = req.body;
  if (!trackingId) {
    const err = new Error('trackingId is required');
    err.statusCode = 400;
    throw err;
  }

  const appointment = await Appointment.findOne({
    trackingId: String(trackingId).trim().toUpperCase(),
  }).populate(populateAppointment);

  if (!appointment) {
    const err = new Error('Appointment not found');
    err.statusCode = 404;
    throw err;
  }

  res.json({ success: true, data: appointment });
});

// Legacy aliases (same handlers)
exports.getMyAppointments = exports.listAppointments;
exports.getDoctorAppointments = exports.listAppointments;
exports.getAllAppointments = asyncHandler(async (req, res) => {
  const list = await Appointment.find()
    .populate(populateAppointment)
    .sort({ createdAt: -1 });
  res.json({ success: true, count: list.length, data: list });
});
exports.updateStatus = exports.updateAppointment;
