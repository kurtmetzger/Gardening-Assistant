require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const db = mongoose.connection;
const path = require('path');
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

app.get('/', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.redirect('login');
    }

    try{
      //gets the calendar info for user zone
      const fullPlantingCalendar = await FullPlantingCalendar.findOne();
      const fullPlantingData = fullPlantingCalendar.toObject();
      const zone = req.user.plantingZone;
  
      //formats today's date to compare to plant ranges
      const date = new Date();
      const formattedDate = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  
  
      const zoneData = fullPlantingData[zone];
      res.render('myGarden', { user: req.user, plantingData: zoneData, dateToday: formattedDate });
    } catch(err) {
      console.error(err);
      res.status(500).send('Error loading myGarden page');
    }
  });

app.post('/removePlant', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.redirect('login');
    }
  
    const userId = req.user._id;
    const {name, datePlanted} = req.body;
  
    try {
      await db.collection('users').updateOne(
        {_id: userId },
        {$pull: {userGarden: {name, datePlanted}}}
      );
      res.redirect('/');
    } catch (err) {
      console.error('Error removing plant:', err);
      res.status(500).send('Could not remove plant');
    }
  });

app.get('/addPlants', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('login');
  }

  try{
    //gets the calendar info for user zone
    const fullPlantingCalendar = await FullPlantingCalendar.findOne();
    const fullPlantingData = fullPlantingCalendar.toObject();
    const zone = req.user.plantingZone;

    //formats today's date to compare to plant ranges
    const date = new Date();
    const formattedDate = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;


    const zoneData = fullPlantingData[zone];
    res.render('addPlants', { user: req.user, plantingData: zoneData, dateToday: formattedDate });
  } catch(err) {
    console.error(err);
    res.status(500).send('Error loading full planting dates in route');
  }
});


app.post('/addToGarden', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('login');
  }

  const {name, datePlanted} = req.body;

  try {
    await db.collection('users').updateOne(
      {_id: req.user._id},
      {$push: {userGarden: {name, datePlanted}}}
    );
    console.log('Added plant to user garden')
    res.redirect('/addPlants');
  } catch (err) {
    console.error(err);
    res.status(500).send("Could not add plant");
  }
});

//Adds planting zone to profile from zipcode. Zipcode is not saved
app.post('/setZone', async (req, res) => {
  const {zipcode} = req.body;
  const userId = req.user._id;

  const zipZone = await db.collection('zipzones').findOne({zipcode});

  if (zipZone) {
    await db.collection('users').updateOne(
      { _id: userId },
      { $set: { plantingZone: zipZone.zone} }
    );
  } else {
    //Error message here
    console.error('Error adding planting zone to user')
  }
  res.redirect('/addPlants');
});

app.get('/login', (req, res) => {
    res.render('login');
});


const registerRoutes = require('./routes/register');

app.use('/', registerRoutes);

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
  }));

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