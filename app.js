require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const db = mongoose.connection;
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { User } = require('./models/user');
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

app.get('/', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.redirect('login');
    }
    res.render('myGarden', { user: req.user });
  });

app.get('/addPlants', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('login');
  }
  res.render('addPlants', { user: req.user });
});

//Adds planting zone to profile from zipcode. Zipcode is not saved
router.post('/setZone', async (req, res) => {
  const { zipcode } = req.body;
  const userId = req.user._id;

  const zipZone = await db.collection('zipzones').findOne({ zipcode });

  if (zipZone) {
    await db.collection('users').updateOne(
      { _id: userId },
      { $set: { zone: zipZone.zone} }
    );
    res.redirect('/addPlants');
  } else {
    
    //Error message
    res.redirect('/');
  }
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