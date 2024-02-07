// Core Imports 
const express = require('express');

// Core Imports 
const viewsController = require('./../controllers/viewsController');
const authController = require('./../controllers/authController');
const bookingController = require('./../controllers/bookingController');

// Variables
const router = express.Router();

// Routing
router.get('/', 
    // bookingController.createBookingCheckout,
    authController.isLoggedIn, 
    viewsController.getOverview);
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/login', authController.isLoggedIn, viewsController.getLogin);
router.get('/me', authController.protect, viewsController.getAccount);
router.get('/my-bookings', authController.protect, viewsController.getBookings);
// Exports
module.exports = router;