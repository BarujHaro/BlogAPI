import express from 'express';
const router = express.Router();
import * as commentController from '../controllers/commentController.js';

router.get('/:postId/comments', commentController.getCommentsByPost);
router.post('/:postId/comments', commentController.createComment);
router.delete('/comments/:commentId', commentController.deleteComment);

export default router;