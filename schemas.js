const Joi = require('joi');

module.exports.hospitalSchema = Joi.object({
    hospital: Joi.object({
        name: Joi.string().required(),
        location: Joi.string().required(),
        image: Joi.string().required(),
        description: Joi.string().required()
    }).required()
});