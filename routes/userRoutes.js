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

router.route('/')
.get(userController.getAllUsers)
.post(userController.createUser);

router.route('/:id')
.get(userController.getUser)
.patch(userController.updateUser)
.delete(userController.deleteUser);

// Exports
module.exports = router;