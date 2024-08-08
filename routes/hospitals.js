const express = require('express')
const router = express.Router();
//const {hospitalSchema} = require('../schemas.js');
const hospitals = require('../controllers/hospitals')
const catchAsync = require('../utils/catchAsync');
const {isLoggedIn,validateHospital,isAuthor} = require('../middleware');
//const ExpressError = require('../utils/ExpressError');
const multer = require('multer');
const {storage} = require('../cloudinary');
const upload = multer({storage});
const Hospital = require('../models/hospital');

router.route('/')
    .get(catchAsync(hospitals.index))
    .post(isLoggedIn, upload.array('image'), validateHospital, catchAsync(hospitals.createHospital))
    

router.get('/new', isLoggedIn, hospitals.renderNewForm);

router.route('/:id')
    .get(catchAsync(hospitals.showHospital))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateHospital,catchAsync(hospitals.updateHospital))
    .delete(isLoggedIn, isAuthor, catchAsync(hospitals.deleteHospital))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(hospitals.renderEditForm));

module.exports = router;
