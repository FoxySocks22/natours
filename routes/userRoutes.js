// Core Imports
const express = require('express');

// Custom Imports
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

// Variables
const router = express.Router();

// Signup & Password Management
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);

// Protect all routes after this middleware
router.use(authController.protect);

// User Management
router.patch('/update-my-password', authController.updatePassword);
router.get('/me', userController.getMe, userController.getUser);
router.patch('/update-account', userController.updateMe);
router.delete('/delete-account', userController.deleteMe);

// Admin Functions
router.use(authController.restrictTo('admin'));

router.route('/')
.get(userController.getAllUsers)
.post(userController.createUser);

router.route('/:id')
.get(userController.getUser)
.patch(userController.updateUser)
.delete(userController.deleteUser);

// Exports
module.exports = router;