// Core Imports 
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

// Custom Imports
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');
const appError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

// Variables
const app = express();

// Template Engine Declaration
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Global Middleware 
// Security headers
app.use(helmet()); 

const scriptSrcUrls = [
    'https://unpkg.com/', 
    'https://tile.openstreetmap.org',
    'https://js.stripe.com/v3/',
    'https://js.stripe.com/'
];

const styleSrcUrls = [
    'https://unpkg.com/',
    'https://tile.openstreetmap.org',
    'https://fonts.googleapis.com/'
];

const connectSrcUrls = [
    'https://unpkg.com', 
    'https://tile.openstreetmap.org'
];

const fontSrcUrls = [
    'fonts.googleapis.com', 
    'fonts.gstatic.com'
];
 
//set security http headers
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'", "js.stripe.com"],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", 'blob:'],
            objectSrc: [],
            imgSrc: ["'self'", 'blob:', 'data:', 'https:'],
            fontSrc: ["'self'", ...fontSrcUrls]
        }
    })
);

const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour.'
}) 

app.use('/api', limiter);

/* This is rate limiting, it aims to prevent attacks such as denial of service 
(DOS) and brute force attacks by blocking excessive requests to the API */

// Data sanitization against nosql injection
app.use(mongoSanitize());

// Data sanitization against cross site scripting (CSS) attacks
app.use(xss());

// Protects against peram polution attacks
app.use(hpp({
    whitelist: [
        'duration',
        'ratingsQuantity',
        'ratingsAverage',
        'difficulty',
        'price',
        'maxGroupSize'
    ] // This can be done better
})); // Whitelist allows for duplicate params

// Third Party Middleware
console.log(process.env.NODE_ENV);
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev')); 
}

// Custom Middleware
app.use(express.json({
    limit: '10kb'
})); // Limit size of body

app.use(cookieParser());

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
})

// Routing
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/booking', bookingRouter);

// 404 Routing
app.all('*', (req, res, next) => {
    next(new appError(`Unable to find ${req.originalUrl} on this server...`, 404));
}) // Anything passed into next is assumed an error, skipping to the error handling middleware in the middleware stack

app.use(globalErrorHandler);

// Exports 
module.exports = app;

/* NOTES
 On security, at some point I want to add Two Factor Authentication (2FA), 
 always amazed me how that works.
 */