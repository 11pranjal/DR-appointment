const express = require('express');
// const { getPosts, createPost, getPostsByDoctor } = require('../controllers/postController');
const { protect, authorize } = require('../middleware/auth');
const {
  getPosts,
  createPost,
  getPostsByDoctor,
  updatePost
} = require('../controllers/postController');

const router = express.Router();

router.get('/', getPosts);
router.get('/doctor/:id', getPostsByDoctor);
router.post('/', protect, authorize('doctor'), createPost);
router.put('/:id', protect, authorize('doctor'), updatePost);

module.exports = router;
