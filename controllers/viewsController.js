// Custom Imports
const Tour = require('./../models/tourModel');
const Bookings = require('./../models/bookingModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Booking = require('./../models/bookingModel');
const factory = require('./handleFactory');

exports.getOverview = catchAsync(async(req, res, next) => {
    const tours = await Tour.find();
    res.status(200).render('overview', {
        title: 'All Tours',
        tours
    })
})

exports.getTour = catchAsync(async(req, res, next) => {
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user'
    });
    if(!tour){
        return next(new AppError('No tour found with that name.', 404));
    }
    res.status(200).render('tour', {
        title: `${tour.name} Tour`,
        tour
    })
})

exports.getLogin = (req, res) => {
    res.status(200).render('login', {
        title: 'Login'
    })
}

exports.getAccount = (req, res) => {
    res.status(200).render('account', {
        title: 'My account'
    })
}

exports.getBookings = catchAsync(async(req, res, next) => {
    const bookings = await Booking.find({ user: req.user.id });
    const tourIds = bookings.map(el => el.tour);
    const tours = await Tour.find({ _id: { $in: tourIds } });
    res.status(200).render('overview', {
        title: 'My Bookings',
        tours
    })
})
// A little confusing. This is the manual version of virtual populate