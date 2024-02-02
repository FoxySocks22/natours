// Core Imports 
const express = require('express');

// Core Imports 
const viewsController = require('./../controllers/viewsController');

// Variables
const router = express.Router();

// Routing
router.get('/', viewsController.getOverview);
router.get('/tour/:slug', viewsController.getTour);

// Exports
module.exports = router;