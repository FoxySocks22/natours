// Core Imports 
const express = require('express');
const morgan = require('morgan');

// Custom Imports
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const appError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

// Variables
const app = express();

// Third Party Middleware
console.log(process.env.NODE_ENV);
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

// Custom Middleware
app.use(express.json());
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
})

// Routing
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// 404 Routing
app.all('*', (req, res, next) => {
    next(new appError(`Unable to find ${req.originalUrl} on this server...`), 404);
}) // Anything passed into next is assumed an error, skipping to the error handling middleware in the middleware stack

app.use(globalErrorHandler);

// Exports 
module.exports = app;