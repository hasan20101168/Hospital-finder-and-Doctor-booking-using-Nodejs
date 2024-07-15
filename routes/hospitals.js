const express = require('express')
const router = express.Router();
const {hospitalSchema} = require('../schemas.js');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Hospital = require('../models/hospital');

const validateHospital = (req, res, next) => {
    const{error} = hospitalSchema.validate(req.body);
    if (error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

router.get('/', catchAsync(async (req, res) => {
	const hospitals = await Hospital.find({});
    res.render('hospitals/index', {hospitals});
}));

router.get('/new', (req, res) => {
    res.render('hospitals/new');
})

router.post('/', validateHospital, catchAsync(async (req, res, next) => {
    const hospital = new Hospital(req.body.hospital);
    await hospital.save();
    res.redirect('/hospitals/new')
}))

router.get('/:id', catchAsync(async (req, res) => {
    const hospital = await Hospital.findById(req.params.id).populate('reviews');
    res.render('hospitals/show', {hospital});
}));

router.get('/:id/edit', catchAsync(async (req, res) => {
    const hospital = await Hospital.findById(req.params.id)
    res.render('hospitals/edit', {hospital});
}));

router.put('/:id', validateHospital,catchAsync(async (req, res) => {
    const {id} = req.params;
    const hospital = await Hospital.findByIdAndUpdate(id, {...req.body.hospital});
    res.redirect(`/hospitals/${hospital._id}`);
}));

router.delete('/:id', catchAsync(async (req, res) => {
    const {id} = req.params;
    await Hospital.findByIdAndDelete(id);
    res.redirect('/hospitals');
}));

module.exports = router;