// Core Imports
const mongoose = require('mongoose');

// Custom Imports
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'You must provide a review.'],
        trim: true,
        minLength: [10, 'You should provide a little more detail.'],
        maxLength: [500, 'Your review is a little too detailed.']
    },
    rating: {
        type: Number,
        required: [true, 'You must provide a rating for your review.'],
        min: [1, 'Your review can not be less than 1.'],
        max: [5, 'Your review can not be above than 5.'],
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must have an author.']
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belond to a tour.']
    }
},{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
}) // Allow virtual output to be visible on response data (virtual methods)

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function(next){
    this.populate({
        path: 'user',
        select: 'name photo'
    })
    next();
})

reviewSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'user',
        select: 'name photo'
    });
    next();
});

// Static method for calculating review average and quantity
// This whole sections seems way to complext...
reviewSchema.statics.calcAverageRatings = async function(tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);  
    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        });
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        });
    }
}

reviewSchema.post('save', function(doc) {
    doc.constructor.calcAverageRatings(doc.tour);
}) // this points to current review

reviewSchema.post(/^findOneAnd/, async function(doc, next) {
    await doc.constructor.calcAverageRating(doc.tour);
    next();
});

const Review = mongoose.model('Review', reviewSchema);
  
module.exports = Review;