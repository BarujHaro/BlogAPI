import express from 'express';
const router = express.Router();
import passport from '../config/passport.js';
import * as postController from '../controllers/postController.js';

router.get('/', postController.getPublishedPosts);
router.post('/', passport.authenticate("jwt", { session: false }), postController.createPost);
router.put('/:id', passport.authenticate("jwt", { session: false }), postController.updatePost); 
router.delete('/:id', passport.authenticate("jwt", { session: false }), postController.deletePost);
router.get('/admin', passport.authenticate("jwt", { session: false }), postController.getAllPostsForAdmin);

export default router; 