const express = require('express');
const { getPosts, createPost, getPostsByDoctor } = require('../controllers/postController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getPosts);
router.get('/doctor/:id', getPostsByDoctor);
router.post('/', protect, authorize('doctor'), createPost);

module.exports = router;
