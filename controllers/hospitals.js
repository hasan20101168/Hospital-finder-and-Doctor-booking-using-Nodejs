const Hospital = require('../models/hospital');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken});

module.exports.index = async (req, res) => {
	const hospitals = await Hospital.find({});
    res.render('hospitals/index', {hospitals});
}

module.exports.renderNewForm = (req, res) => {
    res.render('hospitals/new');
}

module.exports.createHospital = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.hospital.location,
        limit: 1
    }).send()
    const hospital = new Hospital(req.body.hospital);
    hospital.geometry = geoData.body.features[0].geometry;
    hospital.images = req.files.map(f => ({url: f.path, filename: f.filename}));
    hospital.author = req.user._id;
    await hospital.save();
    //console.log(hospital);
    req.flash('success', 'Successfully added a new hospital');
    res.redirect(`/hospitals/${hospital._id}`)
}

module.exports.showHospital = async (req, res) => {
    const hospital = await Hospital.findById(req.params.id).populate({
        path: 'reviews',
        populate:{
            path: 'author'
        }
    }).populate('author');
    
    if (!hospital){
        req.flash('error', 'Cannot find the hospital!');
        return res.redirect('/hospitals');
    }
    res.render('hospitals/show', {hospital});
}

module.exports.renderEditForm = async (req, res) => {
    const {id} = req.params;
    const hospital = await Hospital.findById(id)
    if (!hospital){
        req.flash('error', 'Cannot find the hospital!');
        return res.redirect('/hospitals');
    }
    res.render('hospitals/edit', {hospital});
}

module.exports.updateHospital = async (req, res) => {
    const {id} = req.params;
    const hospital = await Hospital.findByIdAndUpdate(id, {...req.body.hospital});
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename}));
    hospital.images.push(...imgs);
    await hospital.save();
    req.flash('success', 'Successfully updated hospital!');
    res.redirect(`/hospitals/${hospital._id}`);
}

module.exports.deleteHospital = async (req, res) => {
    const {id} = req.params;
    await Hospital.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted hospital!');
    res.redirect('/hospitals');
}