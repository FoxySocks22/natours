// Core Imports 
const express = require('express');

// Core Imports 
const viewsController = require('./../controllers/viewsController');
const authController = require('./../controllers/authController');

// Variables
const router = express.Router();

// Middleware
router.use(authController.isLoggedIn);

// Routing
router.get('/', viewsController.getOverview);
router.get('/tour/:slug', viewsController.getTour);
router.get('/login', viewsController.getLogin);
// Exports
module.exports = router;