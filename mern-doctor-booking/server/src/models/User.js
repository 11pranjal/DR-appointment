const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const doctorProfileSchema = new mongoose.Schema(
  {
    specialization: { type: String, default: '' },
    experience: { type: String, default: '' },
    clinicName: { type: String, default: '' },
    city: { type: String, default: '' },
    consultationFee: { type: Number, default: 500 },
    bio: { type: String, default: '' },
    availableDays: [{ type: String }],
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    phone: {
      type: String,
      default: '',
      validate: {
        validator: function (v) {
          if (!v) return true; // Allow empty for optional field
          return /^\+977\d{10}$/.test(v);
        },
        message: 'Phone must be in format +977XXXXXXXXXX (10 digits after +977)',
      },
    },
    role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    doctorProfile: doctorProfileSchema,
    deletionRequested: { type: Boolean, default: false },
    deletionRequestedAt: { type: Date },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = function matchPassword(plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.toPublicJSON = function toPublicJSON() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
