const express = require('express')
const router = express.Router();
const {hospitalSchema} = require('../schemas.js');
const catchAsync = require('../utils/catchAsync');
const {isLoggedIn} = require('../middleware');

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

router.get('/new', isLoggedIn, (req, res) => {
    res.render('hospitals/new');
})

router.post('/', isLoggedIn, validateHospital, catchAsync(async (req, res, next) => {
    const hospital = new Hospital(req.body.hospital);
    await hospital.save();
    req.flash('success', 'Successfully added a new hospital');
    res.redirect(`/hospitals/${hospital._id}`)
}))

router.get('/:id', catchAsync(async (req, res) => {
    const hospital = await Hospital.findById(req.params.id).populate('reviews');
    if (!hospital){
        req.flash('error', 'Cannot find the hospital!');
        return res.redirect('/hospitals');
    }
    res.render('hospitals/show', {hospital});
}));

router.get('/:id/edit', isLoggedIn,catchAsync(async (req, res) => {
    const hospital = await Hospital.findById(req.params.id)
    if (!hospital){
        req.flash('error', 'Cannot find the hospital!');
        return res.redirect('/hospitals');
    }
    res.render('hospitals/edit', {hospital});
}));

router.put('/:id', isLoggedIn,validateHospital,catchAsync(async (req, res) => {
    const {id} = req.params;
    const hospital = await Hospital.findByIdAndUpdate(id, {...req.body.hospital});
    req.flash('success', 'Successfully updated hospital!');
    res.redirect(`/hospitals/${hospital._id}`);
}));

router.delete('/:id', isLoggedIn,catchAsync(async (req, res) => {
    const {id} = req.params;
    await Hospital.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted hospital!');
    res.redirect('/hospitals');
}));

module.exports = router;