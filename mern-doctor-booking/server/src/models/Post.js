const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    imagePath: { type: String, default: '' },
    imageOriginalName: { type: String, default: '' },
    content: { type: String, required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);
