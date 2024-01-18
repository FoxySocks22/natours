// Core Imports
const express = require('express');

// Custom Imports
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

// Variables
const router = express.Router();

// Routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Password Management
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);

router.route('/')
.get(userController.getAllUsers)
.post(userController.createUser);

router.route('/:id')
.get(userController.getUser)
.patch(userController.updateUser)
.delete(
    authController.protect, 
    authController.restrictTo('admin', 'lead-guide'), 
    userController.deleteUser
);

// Exports
module.exports = router;