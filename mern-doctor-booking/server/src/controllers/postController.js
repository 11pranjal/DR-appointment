const Post = require('../models/Post');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/posts — public
exports.getPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find().populate('doctor', 'firstName lastName doctorProfile');
  res.json({ success: true, data: posts });
});

// POST /api/posts — doctor only
exports.createPost = asyncHandler(async (req, res) => {
  const { title, imageUrl, content } = req.body;
  if (!title || !content) {
    const err = new Error('Title and content required');
    err.statusCode = 400;
    throw err;
  }

  const post = await Post.create({ title, imageUrl, content, doctor: req.user._id });
  res.status(201).json({ success: true, data: post });
});

// GET /api/posts/doctor/:id — public
exports.getPostsByDoctor = asyncHandler(async (req, res) => {
  const posts = await Post.find({ doctor: req.params.id }).populate('doctor', 'firstName lastName');
  res.json({ success: true, data: posts });
});
