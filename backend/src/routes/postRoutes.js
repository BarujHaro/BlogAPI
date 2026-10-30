import express from 'express';
const router = express.Router();
import * as postController from '../controllers/postController.js';

router.get('/', postController.getPublishedPosts);
router.post('/', postController.createPost);
router.delete('/:id', postController.deletePost);

export default router; 