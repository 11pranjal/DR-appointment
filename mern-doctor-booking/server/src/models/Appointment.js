const mongoose = require('mongoose');
const { customAlphabet } = require('nanoid');

const generateTrackingId = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 8);

const appointmentSchema = new mongoose.Schema(
  {
    trackingId: {
      type: String,
      unique: true,
      default: () => generateTrackingId(),
    },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    guestName: { type: String, default: '' },
    guestEmail: { type: String, default: '' },
    guestPhone: { type: String, default: '' },
    scheduleDate: { type: String, required: true },
    scheduleTime: { type: String, required: true },
    reason: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid'],
      default: 'unpaid',
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
