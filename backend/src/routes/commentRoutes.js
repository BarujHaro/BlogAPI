import express from 'express';
const router = express.Router();
import passport from '../config/passport.js';
import * as commentController from '../controllers/commentController.js';

router.get('/:postId/comments', commentController.getCommentsByPost);
router.post('/:postId/comments', commentController.createComment);
router.delete('/comments/:commentId', commentController.deleteComment);

router.get('/admin', passport.authenticate("jwt", { session: false }), commentController.getAllCommentsForAdmin);

export default router;