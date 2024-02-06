// Core Imports
const express = require('express');

// Custom Imports 
const bookingController = require('./../controllers/bookingController');
const authController = require('./../controllers/authController');

// Variables
const router = express.Router();

// Middleware

// Routes
router.get('/checkout-session/:tourId', 
    authController.protect, 
    bookingController.getCheckOutSession
);

module.exports = router;