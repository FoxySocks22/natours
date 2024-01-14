// Core Imports
const express = require('express');

// Custom Imports 
const tourController = require('./../controllers/tourController');

// Variables
const router = express.Router();

// Custom Middleware
// router.param('id', tourController.checkId);

// Routes
router.route('/top-5-cheap')
.get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);

router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router.route('/')
.get(tourController.getAllTours)
.post(tourController.createTour);

router.route('/:id')
.get(tourController.getTour)
.patch(tourController.updateTour)
.delete(tourController.deleteTour);

// Exports
module.exports = router;