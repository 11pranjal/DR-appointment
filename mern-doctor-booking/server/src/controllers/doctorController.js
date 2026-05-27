const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// @route   GET /api/doctors
exports.getDoctors = asyncHandler(async (req, res) => {
  const { city, specialization, search } = req.query;
  const filter = { role: 'doctor' };

  if (city) filter['doctorProfile.city'] = new RegExp(city, 'i');
  if (specialization) filter['doctorProfile.specialization'] = new RegExp(specialization, 'i');
  if (search) {
    filter.$or = [
      { firstName: new RegExp(search, 'i') },
      { lastName: new RegExp(search, 'i') },
      { 'doctorProfile.specialization': new RegExp(search, 'i') },
    ];
  }

  const doctors = await User.find(filter)
    .select('-password')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: doctors.length, data: doctors });
});

// @route   GET /api/doctors/:id
exports.getDoctorById = asyncHandler(async (req, res) => {
  const doctor = await User.findOne({ _id: req.params.id, role: 'doctor' }).select('-password');
  if (!doctor) {
    const err = new Error('Doctor not found');
    err.statusCode = 404;
    throw err;
  }
  res.json({ success: true, data: doctor });
});

// @route   PUT /api/doctors/profile
exports.updateDoctorProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user.role !== 'doctor') {
    const err = new Error('Only doctors can update this profile');
    err.statusCode = 403;
    throw err;
  }

  const fields = ['firstName', 'lastName', 'phone'];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) user[f] = req.body[f];
  });
  if (req.body.doctorProfile) {
    user.doctorProfile = { ...user.doctorProfile.toObject(), ...req.body.doctorProfile };
  }

  await user.save();
  res.json({ success: true, data: user });
});
