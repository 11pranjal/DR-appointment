const Post = require('../models/Post');
const asyncHandler = require('../utils/asyncHandler');
const fs = require('fs');
const path = require('path');

// GET /api/posts — public
exports.getPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find().populate('doctor', 'firstName lastName doctorProfile');
  res.json({ success: true, data: posts });
});

// POST /api/posts — doctor only (with file upload)
exports.createPost = asyncHandler(async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    if (req.file) {
      const uploadsDir = path.join(__dirname, '../../uploads');
      fs.unlink(path.join(uploadsDir, req.file.filename), () => {});
    }
    const err = new Error('Title and content required');
    err.statusCode = 400;
    throw err;
  }

  const post = await Post.create({
    title,
    imagePath: req.file ? req.file.filename : '',
    imageOriginalName: req.file ? req.file.originalname : '',
    content,
    doctor: req.user._id,
  });
  res.status(201).json({ success: true, data: post });
});

// GET /api/posts/doctor/:id — public
exports.getPostsByDoctor = asyncHandler(async (req, res) => {
  const posts = await Post.find({ doctor: req.params.id }).populate('doctor', 'firstName lastName');
  res.json({ success: true, data: posts });
});

// PUT /api/posts/:id — doctor only (with file upload)
exports.updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    if (req.file) {
      const uploadsDir = path.join(__dirname, '../../uploads');
      fs.unlink(path.join(uploadsDir, req.file.filename), () => {});
    }
    const err = new Error('Post not found');
    err.statusCode = 404;
    throw err;
  }

  if (String(post.doctor) !== String(req.user._id)) {
    if (req.file) {
      const uploadsDir = path.join(__dirname, '../../uploads');
      fs.unlink(path.join(uploadsDir, req.file.filename), () => {});
    }
    const err = new Error('Not allowed to edit this post');
    err.statusCode = 403;
    throw err;
  }

  const { title, content } = req.body;
  if (!title || !content) {
    if (req.file) {
      const uploadsDir = path.join(__dirname, '../../uploads');
      fs.unlink(path.join(uploadsDir, req.file.filename), () => {});
    }
    const err = new Error('Title and content required');
    err.statusCode = 400;
    throw err;
  }

  // Delete old image if new one is being uploaded
  if (req.file && post.imagePath) {
    const uploadsDir = path.join(__dirname, '../../uploads');
    fs.unlink(path.join(uploadsDir, post.imagePath), () => {});
  }

  post.title = title;
  post.imagePath = req.file ? req.file.filename : post.imagePath;
  post.imageOriginalName = req.file ? req.file.originalname : post.imageOriginalName;
  post.content = content;
  await post.save();

  const populated = await post.populate('doctor', 'firstName lastName');
  res.json({ success: true, data: populated });
});

// DELETE /api/posts/:id — doctor only
exports.deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    const err = new Error('Post not found');
    err.statusCode = 404;
    throw err;
  }

  if (String(post.doctor) !== String(req.user._id)) {
    const err = new Error('Not allowed to delete this post');
    err.statusCode = 403;
    throw err;
  }

  // Delete image file if exists
  if (post.imagePath) {
    const uploadsDir = path.join(__dirname, '../../uploads');
    fs.unlink(path.join(uploadsDir, post.imagePath), () => {});
  }

  await Post.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Post deleted successfully' });
});
