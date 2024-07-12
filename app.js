const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const methodOverride = require('method-override');

const {hospitalSchema} = require('./schemas.js');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const Hospital = require('./models/hospital');
const User = require('./models/user');
const userRoutes = require('./routes/users');
const Review = require('./models/review');

mongoose.connect('mongodb://127.0.0.1:27017/hospitalDB')
    .then(() => {
        console.log("Database connected succesfully!")
    })
    .catch(err => {
        console.log("Database connection Error!!")
        console.log(err)
    })

app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.set ('view engine', 'ejs');

const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000*60*60*24*7,
        maxAge: 1000*60*60*24*7
    }
}

app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'))
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use('/', userRoutes);

const validateHospital = (req, res, next) => {
    const{error} = hospitalSchema.validate(req.body);
    if (error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/hospitals', catchAsync(async (req, res) => {
	const hospitals = await Hospital.find({});
    res.render('hospitals/index', {hospitals});
}));

app.get('/hospitals/new', (req, res) => {
    res.render('hospitals/new');
})

app.post('/hospitals', validateHospital, catchAsync(async (req, res, next) => {
    const hospital = new Hospital(req.body.hospital);
    await hospital.save();
    res.redirect('/hospitals/new')
}))

app.get('/hospitals/:id', catchAsync(async (req, res) => {
    const hospital = await Hospital.findById(req.params.id)
    res.render('hospitals/show', {hospital});
}));

app.get('/hospitals/:id/edit', catchAsync(async (req, res) => {
    const hospital = await Hospital.findById(req.params.id)
    res.render('hospitals/edit', {hospital});
}));

app.put('/hospitals/:id', validateHospital,catchAsync(async (req, res) => {
    const {id} = req.params;
    const hospital = await Hospital.findByIdAndUpdate(id, {...req.body.hospital});
    res.redirect(`/hospitals/${hospital._id}`);
}));

app.delete('/hospitals/:id', catchAsync(async (req, res) => {
    const {id} = req.params;
    await Hospital.findByIdAndDelete(id);
    res.redirect('/hospitals');
}));

app.post('/hospitals/:id/reviews', catchAsync(async(req, res) => {
    const hospital = await Hospital.findById(req.params.id);
    const review = new Review(req.body.review);
    hospital.reviews.push(review);
    await review.save();
    await hospital.save();
    res.redirect(`/hospitals/${hospital._id}`);
}))

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const {statusCode = 500 } = err;
    if (!err.message) err.message = 'Something went wrong!'
    res.status(statusCode).render('error', {err});
})

app.listen(3000, () => {
	console.log("listening on port 3000");
})