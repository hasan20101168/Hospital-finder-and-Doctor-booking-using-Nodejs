const express = require('express')
const router = express.Router({mergeParams: true});

const Hospital = require('../models/hospital');
const Review = require('../models/review');

const {reviewSchema} = require('../schemas.js');
const {validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

router.post('/', isLoggedIn, validateReview, catchAsync(async(req, res) => {
    const hospital = await Hospital.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    hospital.reviews.push(review);
    await review.save();
    await hospital.save();
    req.flash('success', 'Thanks for your review');
    res.redirect(`/hospitals/${hospital._id}`);
}))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async(req, res) => {
    const { id, reviewId} = req.params;
    await Hospital.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Your review has been deleted');
    res.redirect(`/hospitals/${id}`);
}))

module.exports = router;