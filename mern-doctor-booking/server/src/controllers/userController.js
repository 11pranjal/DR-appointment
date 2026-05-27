const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const publicUser = (user) => ({
  _id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  phone: user.phone,
  role: user.role,
  isEmailVerified: user.isEmailVerified,
  doctorProfile: user.doctorProfile,
  deletionRequested: user.deletionRequested,
  deletionRequestedAt: user.deletionRequestedAt,
  createdAt: user.createdAt,
});

// GET /api/users — admin
exports.getUsers = asyncHandler(async (req, res) => {
  const { role, deletionRequested } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (deletionRequested !== undefined) filter.deletionRequested = deletionRequested === 'true';

  const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
  res.json({ success: true, count: users.length, data: users.map(publicUser) });
});

// GET /api/users/:id — admin or self
exports.getUserById = asyncHandler(async (req, res) => {
  const isSelf = String(req.user._id) === req.params.id;
  const isAdmin = req.user.role === 'admin';
  if (!isSelf && !isAdmin) {
    const err = new Error('Not allowed');
    err.statusCode = 403;
    throw err;
  }
  const user = await User.findById(req.params.id).select('-password');
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  res.json({ success: true, data: publicUser(user) });
});

// PUT /api/users/:id — admin or self (standard update)
exports.updateUser = asyncHandler(async (req, res) => {
  const isSelf = String(req.user._id) === req.params.id;
  const isAdmin = req.user.role === 'admin';
  if (!isSelf && !isAdmin) {
    const err = new Error('Not allowed');
    err.statusCode = 403;
    throw err;
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  const { firstName, lastName, phone, doctorProfile, role, deletionRequested } = req.body;
  if (firstName !== undefined) user.firstName = firstName;
  if (lastName !== undefined) user.lastName = lastName;
  if (phone !== undefined) user.phone = phone;
  if (doctorProfile && user.role === 'doctor') {
    user.doctorProfile = { ...user.doctorProfile.toObject(), ...doctorProfile };
  }
  if (isAdmin && role) user.role = role;
  if (isAdmin && deletionRequested === false) {
    user.deletionRequested = false;
    user.deletionRequestedAt = undefined;
  }

  await user.save();
  res.json({ success: true, data: publicUser(user) });
});

// DELETE /api/users/:id — admin or self
exports.deleteUser = asyncHandler(async (req, res) => {
  const isSelf = String(req.user._id) === req.params.id;
  const isAdmin = req.user.role === 'admin';
  if (!isSelf && !isAdmin) {
    const err = new Error('Not allowed');
    err.statusCode = 403;
    throw err;
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  // If admin requests deletion, perform immediate deletion
  if (isAdmin) {
    await user.deleteOne();
    return res.json({ success: true, message: 'User deleted by admin' });
  }

  // If self-requesting deletion, mark deletionRequested for admin approval
  user.deletionRequested = true;
  user.deletionRequestedAt = new Date();
  await user.save();
  res.json({ success: true, message: 'Account deletion requested. Admin will confirm.' });
});
