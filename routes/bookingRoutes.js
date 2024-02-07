// Core Imports
const express = require('express');

// Custom Imports 
const bookingController = require('./../controllers/bookingController');
const authController = require('./../controllers/authController');

// Variables
const router = express.Router();

// Middleware

router.use(authController.protect);

// Routes
router.get('/checkout-session/:tourId', 
bookingController.getCheckOutSession
);

router.use(authController.restrictTo('admin', 'lead-guide'));

router.route('/')
    .get(bookingController.getAllBookings)
    .post(bookingController.createBooking);

router.route('/:id')
    .get(bookingController.getBooking)
    .patch(bookingController.updateBooking)
    .delete(bookingController.deleteBooking);

module.exports = router;