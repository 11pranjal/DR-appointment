const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getPosts,
  createPost,
  getPostsByDoctor,
  updatePost,
  deletePost
} = require('../controllers/postController');

const router = express.Router();

router.get('/', getPosts);
router.get('/doctor/:id', getPostsByDoctor);
router.post('/', protect, authorize('doctor'), upload.single('image'), createPost);
router.put('/:id', protect, authorize('doctor'), upload.single('image'), updatePost);
router.delete('/:id', protect, authorize('doctor'), deletePost);

module.exports = router;
