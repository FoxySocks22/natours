// Core imports
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Custom imports 
const Tour = require('./../models/tourModel');
const factory = require('./handleFactory');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');

exports.getCheckOutSession = catchAsync(async(req, res, mext) => {
    const tour = await Tour.findById(req.params.tourId);
    // const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        mode: 'payment',
        line_items: [
            {
                quantity: 1,
                price_data: {
                    currency: 'gbp',
                    unit_amount: tour.price * 100,
                    product_data: {
                        name: `${tour.name} Tour`,
                        description: tour.summary,
                        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
                    },
                },
            },
        ],
    });
    res.status(200).json({
        status: 'success',
        session,
    });
    next();
})