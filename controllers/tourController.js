// Core Imports

// Custom Imports
const Tour = require('./../models/tourModel');
const apiFeatures = require('./../utils/apiFeatures');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');

// Methods 
// This is an example of custom middleware
exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
    const features = new apiFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .projection()
    .pagination();
    // Execute The Query
    const tours = await features.query;
    // Send Response
    res.status(200).json({
        status: 'success',
        result: tours.length,
        data: {
            tours
        }
    });
});

/* The :id automatically assigns a param from the url, they are defined in the order
they appear in the url, if we want an optional onemptied, we append a ? */
exports.getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.id);
    if(!tour){
       return next(new AppError(`No tour found for Id: ${req.params.id}`, 404));
    } 
    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    });
});

exports.createTour = catchAsync(async (req, res, next) => {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            tour: newTour
        }
    });
});

exports.updateTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if(!tour){
        return next(new AppError(`No tour found for Id: ${req.params.id}`, 404));
    } 
    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    })
});

exports.deleteTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    if(!tour){
        return next(new AppError(`No tour found for Id: ${req.params.id}`, 404));
    } 
    res.status(204).json({
        status: 'success',
        data: null
    })
});

exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {
            $group: {
                _id: { $toUpper: '$difficulty' },
                numTours: { $sum: 1 },
                numRatings: { $sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' }
            }
        },
        {
            $sort: { avgPrice: 1 }
        }
    ]);
    res.status(200).json({
        status: 'success',
        data: {
            stats
        }
    });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numOfTourStarts: { $sum: 1 },
                tours: { $push: '$name' }
            }
        },
        {
            $addFields: { month: '$_id' }
        },
        {
            $project: { _id: 0 }
        },
        {
            $sort: { numOfTourStarts: -1 } // - 1 is accending and 1 is decending
        },
        {
            $limit: 12 // This is just a demo
        }
    ])
    res.status(200).json({
        status: 'success',
        data: {
            plan
        }
    });
});