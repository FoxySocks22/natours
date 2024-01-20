// Core Imports
const mongoose = require('mongoose');

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
    author: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'Review must have ann author.']
        }
    ],
    tour: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            required: [true, 'Review must belond to a tour.']
        }
    ]
},{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
}) // Allow virtual output to be visible on response data (virtual methods)

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;