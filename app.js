if (process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

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

/*const {hospitalSchema, reviewSchema} = require('./schemas.js');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const Hospital = require('./models/hospital');
const Review = require('./models/review');*/

const User = require('./models/user');
const Doctor = require('./models/doctor');
const Hospital = require('./models/hospital');

const userRoutes = require('./routes/users');
const hospitalRoutes = require('./routes/hospitals');
const reviewRoutes = require('./routes/reviews');
const catchAsync = require('./utils/catchAsync');

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
app.use(express.static(path.join(__dirname,'public')));
app.use(methodOverride('_method'))
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', userRoutes);
app.use('/hospitals', hospitalRoutes);
app.use('/hospitals/:id/reviews', reviewRoutes);

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/uhospital', async (req, res) => {
    const hospitals = await Hospital.find({});
    res.render('admins/index', {hospitals});
})

app.get('/uhospitals/:id', async(req, res) => {
    const hospital = await Hospital.findById(req.params.id).populate({
        path: 'reviews',
        populate:{
            path: 'author'
        }
    }).populate('author').populate('doctors');
    
    if (!hospital){
        req.flash('error', 'Cannot find the hospital!');
        return res.redirect('/hospitals');
    }
    res.render('admins/show', {hospital});
})

app.get('/uhospitals/:id/doctors', async(req, res) => {
    const hospital = await Hospital.findById(req.params.id).populate('doctors');
    res.render('admins/doctors', {hospital});
})

app.get('/appointment', async(req, res) => {
    res.render('admins/appointment');
})


app.post('/hospitals/:id/doctors', catchAsync(async(req, res) => {
    const hospital = await Hospital.findById(req.params.id);
    const doctor = new Doctor(req.body.doctor);
    hospital.doctors.push(doctor);
    await doctor.save();
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