// Core Imports
const express = require('express');

// Custom Imports 
const reviewRouter = require('./../routes/reviewRoutes');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');

// Variables
const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);
/* Routers are still just middleware, so we can use the USE keyword. 
The code above is enabling nexted routes, and is basically saying if a URL looks 
like this, use the review route instead. This is still mounting a router. */

// Routes
router.route('/top-5-cheap')
.get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);

router.route('/monthly-plan/:year').get(
    authController.protect, 
    authController.restrictTo('admin', 'lead-guide', 'guide'), 
    tourController.getMonthlyPlan);

router.route('/')
.get(tourController.getAllTours)
.post(
    authController.protect, 
    authController.restrictTo('admin', 'lead-guide'), 
    tourController.createTour);

router.route('/:id')
.get(tourController.getTour)
.patch(
    authController.protect, 
    authController.restrictTo('admin', 'lead-guide'), 
    tourController.updateTour)
.delete(
    authController.protect, 
    authController.restrictTo('admin', 'lead-guide'), 
    tourController.deleteTour
);

// Exports
module.exports = router;