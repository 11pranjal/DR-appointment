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

// PUT /api/posts/:id — doctor only
exports.updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    const err = new Error('Post not found');
    err.statusCode = 404;
    throw err;
  }

  if (String(post.doctor) !== String(req.user._id)) {
    const err = new Error('Not allowed to edit this post');
    err.statusCode = 403;
    throw err;
  }

  const { title, imageUrl, content } = req.body;
  if (!title || !content) {
    const err = new Error('Title and content required');
    err.statusCode = 400;
    throw err;
  }

  post.title = title;
  post.imageUrl = imageUrl || '';
  post.content = content;
  await post.save();

  const populated = await post.populate('doctor', 'firstName lastName');
  res.json({ success: true, data: populated });
});
