// Core imports
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Custom imports 
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const factory = require('./handleFactory');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getCheckOutSession = catchAsync(async(req, res, mext) => {
    const tour = await Tour.findById(req.params.tourId);
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        // success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
        success_url: `${req.protocol}://${req.get('host')}/my-bookings`,
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
                        images: [
                            `${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`
                        ],
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

// exports.createBookingCheckout = catchAsync(async(req, res, next) => {
//     // This is only an interim pre-deployment solution
//     const { tour, user, price } = req.query;
//     if(!tour || !user || !price) return next();
//     await Booking.create({ tour, user, price });
//     res.redirect(req.originalUrl.split('?')[0]);
// })
// THE SUCCESS URL IS AN INTERIM SOLUTION UNTIL DEPLOYMENT

const createBookingCheckout = catchAsync(async session => {
    const tour = session.client_reference_id;
    const user = (await User.findOne({ email: session.customer_email })).id;
    const price = session.display_items[0].amount / 100;
    await Booking.create({ tour, user, price });

})

exports.webhookCheckout = (req, res, next) => {
    const signature = req.headers['stripe-signature'];
    let event;
    try {
        event = stripe.webhooks.constructEvent(
            req.body, 
            signature, 
            process.env.STRIPE_WEBHOOK_SECRET
            )
    } catch(err){
        return res.status(400).send(`Webhook error: ${err.message}`)
    }
    if(event.type === 'checkout.session.completed') createBookingCheckout(event.data.object);
    res.status(200).json({ received: true });
} // This is pretty complicated TBH

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);