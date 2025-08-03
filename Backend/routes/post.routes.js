const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const postController = require('../controllers/post.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post(
  '/',
  authMiddleware.authUser,
  [body('text').notEmpty().withMessage('Text is required')],
  postController.CreatePost
);
router.get('/', postController.getAllPost);
router.get('/me', authMiddleware.authUser, postController.getMyPosts);
router.get('/user/:userId', postController.getPostsByUser);
router.get('/following', authMiddleware.authUser, postController.getFollowingPosts);
router.get('/:id',  authMiddleware.authUser,postController.getPostById);
router.patch('/like/:_id', authMiddleware.authUser, postController.likePost);
router.post(
  '/comment/:_id',
  authMiddleware.authUser,
  [body('text').notEmpty().withMessage('Comment text is required')],
  postController.commentOnPost
);
router.patch('/repost/:_id', authMiddleware.authUser, postController.repostPost);
router.patch('/edit/:_id', authMiddleware.authUser, postController.editPost);
router.patch(
  '/comment/:_id/edit',
  authMiddleware.authUser,
  [body('text').notEmpty().withMessage('Updated comment text is required')],
  postController.editComment
);

router.delete(
  '/comment/:_id',
  authMiddleware.authUser,
  postController.deleteComment
);
router.delete('/:_id', authMiddleware.authUser, postController.deletePost);
module.exports = router;
