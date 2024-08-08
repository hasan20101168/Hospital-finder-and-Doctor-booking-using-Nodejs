const Joi = require('joi');

module.exports.hospitalSchema = Joi.object({
    hospital: Joi.object({
        name: Joi.string().required(),
        location: Joi.string().required(),
        //image: Joi.string().required(),
        description: Joi.string().required()
    }).required()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(0).max(5),
        body: Joi.string().required()
    }).required()
});