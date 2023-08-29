const express = require('express');
const usersService = require('../services/users.service');
const { validateBody, isAuth, upload } = require('../middlewares');
const { schemas } = require('../models/user.model');

const router = express.Router();

// @desc    Register
// @route 	POST /api/users/register
// @access  Public
router.post('/register', validateBody(schemas.registerSchema), usersService.register);

// @desc    Verify email
// @route 	GET /api/users/verify/:code
// @access  Public
router.get('/verify/:verificationToken', usersService.verifyEmail);

// @desc    Reverify email
// @route 	POST /api/users/verify
// @access  Public
router.post('/verify', validateBody(schemas.emailSchema), usersService.resendVerifyEmail);

// @desc    Login
// @route 	POST /api/users/login
// @access  Public
router.post('/login', validateBody(schemas.loginSchema), usersService.login);

// @desc    Logout
// @route 	POST /api/users/logout
// @access  Private
router.post('/logout', isAuth, usersService.logout);

// @desc    Current
// @route 	GET /api/users/current
// @access  Private
router.get('/current', isAuth, usersService.current);

// @desc    Update User -> Subscription
// @route 	PATCH /api/users/subscription
// @access  Private
// @test    http://localhost:3000/avatars/file_name.jpeg
router.patch('/subscription', isAuth, validateBody(schemas.updateSubscriptionSchema), usersService.updateSubscription);

// @desc    Update User -> Avatar
// @route 	PATCH /api/users/avatars
// @access  Private
router.patch('/avatars', isAuth, upload.single('avatar'), usersService.updateAvatar);

module.exports = router;
