const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('../utils/asyncHandler');
const createVerificationToken = require('../utils/verificationToken');
const { sendEmail } = require('../utils/sendEmail');

const publicUserFields = (user) => ({
  _id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  role: user.role,
  phone: user.phone,
  isEmailVerified: user.isEmailVerified,
  isApproved: user.isApproved,
  approvalStatus: user.approvalStatus,
  doctorProfile: user.doctorProfile,
});

const sendAuthResponse = (res, user, statusCode = 200) => {
  const token = generateToken(user._id, user.role);
  res.status(statusCode).json({
    success: true,
    token,
    user: publicUserFields(user),
  });
};

const sendVerificationEmail = async (user, token) => {
  const appUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const link = `${appUrl}/verify-email/${token}`;

  await sendEmail({
    to: user.email,
    subject: 'Verify your MediBook account',
    text: `Hi ${user.firstName},\n\nClick to verify your email:\n${link}\n\nLink expires in 24 hours.`,
    html: `<p>Hi ${user.firstName},</p><p><a href="${link}">Verify your email</a></p><p>Or copy: ${link}</p>`,
  });
};

// POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, phone, role, doctorProfile } = req.body;
  const normalizedEmail = email?.toLowerCase().trim();

  if (!firstName || !lastName || !normalizedEmail || !password || !phone) {
    const err = new Error('Please provide firstName, lastName, email, password and phone');
    err.statusCode = 400;
    throw err;
  }

  const cleanedPhone = phone.trim();
  const normalizedPhone = /^\d{10}$/.test(cleanedPhone) ? `+977${cleanedPhone}` : cleanedPhone;
  if (!/^\+977\d{10}$/.test(normalizedPhone)) {
    const err = new Error('Phone must be in format +977XXXXXXXXXX (10 digits after +977)');
    err.statusCode = 400;
    throw err;
  }

  const exists = await User.findOne({ email: normalizedEmail });
  if (exists) {
    const err = new Error('Email already registered');
    err.statusCode = 400;
    throw err;
  }

  const safeRole = ['patient', 'doctor'].includes(role) ? role : 'patient';
  const { token, expires } = createVerificationToken();

  const user = await User.create({
    firstName,
    lastName,
    email: normalizedEmail,
    password,
    phone: normalizedPhone,
    role: safeRole,
    isEmailVerified: false,
    isApproved: safeRole === 'doctor' ? false : true,
    approvalStatus: safeRole === 'doctor' ? 'pending' : 'approved',
    approvalRequestedAt: safeRole === 'doctor' ? new Date() : undefined,
    emailVerificationToken: token,
    emailVerificationExpires: expires,
    ...(safeRole === 'doctor' && {
      doctorProfile: doctorProfile || {
        specialization: 'General Physician',
        consultationFee: 500,
        city: 'Your City',
        profileComplete: false,
      },
    }),
  });

  await sendVerificationEmail(user, token);

  res.status(201).json({
    success: true,
    message: 'Account created. Check your email to verify before logging in.',
    user: publicUserFields(user),
  });
});

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email?.toLowerCase().trim();

  if (!normalizedEmail || !password) {
    const err = new Error('Email and password required');
    err.statusCode = 400;
    throw err;
  }

  const user = await User.findOne({ email: normalizedEmail }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  if (user.role !== 'admin' && !user.isEmailVerified) {
    const err = new Error('Please verify your email first. Check inbox or resend verification.');
    err.statusCode = 403;
    throw err;
  }

  if (user.role === 'doctor' && user.approvalStatus !== 'approved') {
    const err = new Error(
      user.approvalStatus === 'denied'
        ? 'Your doctor account request was denied by admin.'
        : 'Doctor account pending admin approval. Please wait for approval before logging in.'
    );
    err.statusCode = 403;
    throw err;
  }

  sendAuthResponse(res, user);
});

// GET /api/auth/verify-email/:token
exports.verifyEmail = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    emailVerificationToken: req.params.token,
    emailVerificationExpires: { $gt: new Date() },
  }).select('+emailVerificationToken +emailVerificationExpires');

  if (!user) {
    const err = new Error('Invalid or expired verification link');
    err.statusCode = 400;
    throw err;
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  if (user.role === 'doctor' && user.approvalStatus !== 'approved') {
    return res.json({
      success: true,
      message:
        user.approvalStatus === 'denied'
          ? 'Email verified. Your doctor account request was denied by admin.'
          : 'Email verified. Your doctor account is pending admin approval before you can log in.',
      user: publicUserFields(user),
    });
  }

  sendAuthResponse(res, user);
});

// POST /api/auth/resend-verification
exports.resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    const err = new Error('Email is required');
    err.statusCode = 400;
    throw err;
  }

  const user = await User.findOne({ email }).select(
    '+emailVerificationToken +emailVerificationExpires'
  );

  if (!user) {
    return res.json({ success: true, message: 'If that email exists, we sent a new link.' });
  }

  if (user.isEmailVerified) {
    return res.json({ success: true, message: 'Email is already verified. You can log in.' });
  }

  const { token, expires } = createVerificationToken();
  user.emailVerificationToken = token;
  user.emailVerificationExpires = expires;
  await user.save();
  await sendVerificationEmail(user, token);

  res.json({ success: true, message: 'Verification email sent.' });
});

// GET /api/auth/me
exports.getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: publicUserFields(req.user) });
});
