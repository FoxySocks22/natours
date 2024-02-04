// Core Imports 
const express = require('express');

// Core Imports 
const viewsController = require('./../controllers/viewsController');
const authController = require('./../controllers/authController');

// Variables
const router = express.Router();

// Routing
router.get('/', authController.isLoggedIn, viewsController.getOverview);
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/login', authController.isLoggedIn, viewsController.getLogin);
router.get('/me', authController.protect, viewsController.getAccount);
// Exports
module.exports = router;