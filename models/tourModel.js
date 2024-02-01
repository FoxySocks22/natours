// Core Imports
const mongoose = require('mongoose');
const slugify = require('slugify');

const toursSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: [true, 'A tour must have a name.'],
        unique: true,
        trim: true,
        minLength: [10, 'A tour name must not have more less than 10 characters.'],
        maxLength: [40, 'A tour name must not have more than 40 characters.']
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour duration is required.']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A maximum group size is required.']
    },
    difficulty: {
        type: String,
        required: [true, 'A difficulty rating is required.'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'A tour must be: easy, medium or difficult.'
        }
    },
    ratingsAverage: {
        type: Number, 
        default: 4.5,
        min: [1, 'Ratings can not be below 1.'],
        max: [5, 'Ratings can not be above 5.'],
        set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
        type: Number, 
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function(val) {
                return val < this.price;
            }, // The this keyword refers to the current document
            message: 'Discount price can not be higher than ({VALUE}).'
        } // This validator will not work on update
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a description.']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A cover image must be provided.']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    }, 
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        // geoJSON
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        },
    ],
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ]
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

toursSchema.index({ slug: 1 }); 
toursSchema.index({ price: 1, ratingsAverage: -1 }); 
toursSchema.index({ startLocation: '2dsphere' });
/* Remember 1 is ascending and -1 is decending oder
This is compounf indexing, it helps with performance of queries better 
at scale. Apply these depending on access frequency, so price and rating are
likely to be more common than group size. Indexes are resources and thus 
have a cost to use, so use them appropriately. */

toursSchema.virtual('durationInWeeks').get(function(){
    const weeks = this.duration / 7;
    return weeks.toFixed(1); // A real function was used to access the this keyword
}) // A virtual property is returned with the data but not saved in the DB

// Document middleware
toursSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower: true });
    next();
}) 
// Document middleware, that can run pre or post event, also called hooks
// The this keyword relates to the document that is being saved
// You can have multiple pre & post save hooks 
// Use next all the time for good practise

// Query middleware
toursSchema.pre(/^find/, function(next){
    this.find({ secretTour: { $ne: true } });
    this.start = Date.now();
    next();
}) // The this object here is a query object

toursSchema.pre(/^find/, function(next, docs){
    console.log(`This query took ${Date.now() - this.start} ms to execute.`);
    next();
})

toursSchema.pre(/^find/, function(next){
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt'
    })
    next();
})

toursSchema.post('save', function(doc, next) {
    console.log(`${doc.name} was saved to the database.`);
    next();
})

// Aggregation middleware
// toursSchema.pre('aggregate', function(next){
//     this.pipeline().unshift({ $match: { secretTour: { $ne: true }}});
//     next();
// }) 
// The this keyword here refers to the current aggregation object 

// Virtual Populate
toursSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
}) 
/* Similar to SQL joins, it will link the ID field in this model to 
the tour field in the review model */

const Tour = mongoose.model('Tour', toursSchema);

module.exports = Tour;