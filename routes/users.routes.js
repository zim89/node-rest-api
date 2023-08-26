const express = require('express');
const usersService = require('../services/users.service');
const { validateBody, isAuth } = require('../middlewares');
const { schemas } = require('../models/user.model');

const router = express.Router();

// @desc    Register
// @route 	POST /api/users/register
// @access  Public
router.post('/register', validateBody(schemas.registerSchema), usersService.register);

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
router.patch('/subscription', isAuth, validateBody(schemas.updateSubscriptionSchema), usersService.updateSubscription);

module.exports = router;
