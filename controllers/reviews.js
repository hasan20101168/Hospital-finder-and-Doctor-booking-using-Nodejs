const Hospital = require('../models/hospital');
const Review = require('../models/review');

module.exports.createReview = async(req, res) => {
    const hospital = await Hospital.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    hospital.reviews.push(review);
    await review.save();
    await hospital.save();
    req.flash('success', 'Thanks for your review');
    res.redirect(`/hospitals/${hospital._id}`);
}

module.exports.deleteReview = async(req, res) => {
    const { id, reviewId} = req.params;
    await Hospital.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Your review has been deleted');
    res.redirect(`/hospitals/${id}`);
}