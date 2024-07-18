const express = require('express')
const router = express.Router({mergeParams: true});
const Hospital = require('../models/hospital');
const Review = require('../models/review');
const reviews = require('../controllers/reviews');
const {reviewSchema} = require('../schemas.js');
const {validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;