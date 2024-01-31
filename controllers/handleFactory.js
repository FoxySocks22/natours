// Custom Imports 
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const { populate } = require('../models/tourModel');
const apiFeatures = require('./../utils/apiFeatures');

exports.createOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            data: doc
        }
    });
});
/* The :id automatically assigns a param from the url, they are defined in the order
they appear in the url, if we want an optional param, we append a ? */

exports.getOne = (Model, populateOptions) => catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if(populate) query = query.populate(populateOptions);
    const doc = await query;
    if(!doc){
       return next(new AppError(`No document found for Id: ${req.params.id}`, 404));
    } 
    res.status(200).json({
        status: 'success',
        data: {
            data: doc
        }
    });
});

exports.getAll = Model => catchAsync(async (req, res, next) => {
    let filter = {};
    if(req.params.tourId) filter = { tour: req.params.tourId }; // {get all reviews by tour optional}
    // The above is a hack, as it is only needed for getAllReviews
    const features = new apiFeatures(Model.find(filter), req.query)
    .filter()
    .sort()
    .projection()
    .pagination();
    // Execute The Query
    const doc = await features.query; //add .explain() for info about the query
    // Send Response
    res.status(200).json({
        status: 'success',
        result: doc.length,
        data: {
            data: doc
        }
    });
    next();
});

exports.updateOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if(!doc){
        return next(new AppError(`No document found for Id: ${req.params.id}`, 404));
    } 
    res.status(200).json({
        status: 'success',
        data: {
            data: doc
        }
    })
});

exports.deleteOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if(!doc){
        return next(new AppError(`No document found for Id: ${req.params.id}`, 404));
    } 
    res.status(204).json({
        status: 'success',
        data: null
    })
});

/* Notes
- Factory function return function, it makes them more reusable and more DRY.
- This factory function file is here, becuase it will be returnign 
  controller functions
- Factories work on the principle of closure
*/