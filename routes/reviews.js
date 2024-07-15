const express = require('express')
const router = express.Router({mergeParams: true});

const Hospital = require('../models/hospital');
const Review = require('../models/review');

const {reviewSchema} = require('../schemas.js');

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

const validateReview = (req, res, next) => {
    const{error} = reviewSchema.validate(req.body);
    if (error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

router.post('/', validateReview, catchAsync(async(req, res) => {
    const hospital = await Hospital.findById(req.params.id);
    const review = new Review(req.body.review);
    hospital.reviews.push(review);
    await review.save();
    await hospital.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/hospitals/${hospital._id}`);
}))

router.delete('/:reviewId', catchAsync(async(req, res) => {
    const { id, reviewId} = req.params;
    await Hospital.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Deleted review successfully!');
    res.redirect(`/hospitals/${id}`);
}))

module.exports = router;