const express = require('express');
const router = express.Router();
const {body} =  require('express-validator');
const userController = require('../controllers/user.controller')
const authMiddleware = require('../middlewares/auth.middleware')
router.post('/register',[
    body('email').isEmail().withMessage('Invalid Email Address'),
    body('fullname.firstname').isLength({min:3}).withMessage('First Name must be atleast 3 character long'),
    body('password').isLength({min:6}).withMessage('Password must be 6 characters long')
],
userController.registerUser
)
router.post('/login',[
    body('email').isEmail().withMessage('Invalid Email'),
    body('password').isLength({min:6}).withMessage('password is incorrect')
],
userController.loginUser
)
router.get('/profile',authMiddleware.authUser,userController.getUserProfile)
router.get('/user/:id',authMiddleware.authUser,userController.anotherUserProfile)
router.patch('/profile/bio',authMiddleware.authUser,userController.updateBio)

module.exports = router;