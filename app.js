require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const db = mongoose.connection;
const path = require('path');
const { ObjectId } = require('mongodb');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { User } = require('./models/user');
const FullPlantingCalendar = require('./models/fullPlantingCalendar');
const app = express();

mongoose.connect(process.env.DATABASE_URL);
mongoose.set('strictQuery', true);
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to Database'));

app.use(express.urlencoded({extended: true}));

app.use(session({
    secret: 'Alliums repel pests',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy({ usernameField: 'email'}, User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true}));

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
  }

app.use(express.static(path.join(__dirname, 'public')));

//My Garden page
const myGardenRoutes = require('./routes/myGarden');
app.use('/', myGardenRoutes);


//add Plants route
const addPlantsRoutes = require('./routes/addPlants');
app.use('/', addPlantsRoutes);

//Profile options route
const profileOptionsRoutes = require('./routes/profileOptions');
app.use('/', profileOptionsRoutes);


//FaQ route
const FaQRoutes = require('./routes/FaQ');
app.use('/', FaQRoutes);


//Adds planting zone to profile from zipcode. Zipcode is not saved (needs to be seen from multiple pages)
app.post('/setZone', async (req, res) => {
  const {zipcode} = req.body;
  const userId = req.user._id;

  const zipZone = await db.collection('zipzones').findOne({zipcode});

  if (zipZone) {
    try{
      await db.collection('users').updateOne(
        { _id: userId },
        { $set: { plantingZone: zipZone.zone} }
      );
    } catch(err){
      console.error(err);
      console.error('Error adding planting zone to user');
    }
  } else {
    console.error('Invalid zip code')
  }
  //Lets the page that makes the request refresh so it can be used from 'addPlants' or 'profileOptions'
  const returnURL = req.get('referer') || '/';
  res.redirect(returnURL);
});

app.get('/login', (req, res) => {
    const usererror = req.query.login;

    res.render('login', {usererror: usererror});
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login?login=failure',
  }));


//Register route
const registerRoutes = require('./routes/register');
app.use('/', registerRoutes);

app.get('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect('/login');
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});