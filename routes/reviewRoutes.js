// Core Imports
const express = require('express');

// Custom Imports 
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

// Variables
const router = express.Router({ mergeParams: true });

/* mergeParams allows access to params from other routes, and here is 
essentailly enabling nested routing in a more intuitive way, utilising Express */

// Middleware
router.use(authController.protect);

// Routes
router.route('/')
.get(reviewController.getAllReviews)
.post(
    authController.restrictTo('user'), 
    reviewController.setTourAndUserIds,
    reviewController.createReview);

router.route('/:id')
.get(reviewController.getReview)
.delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview)
.patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview);

module.exports = router;