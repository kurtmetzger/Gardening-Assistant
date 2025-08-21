const express = require('express');
const router = express.Router();
const FullPlantingCalendar = require('../models/fullPlantingCalendar');
const { User } = require('../models/user');
const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const db = mongoose.connection;

router.get('/addPlants', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.redirect('login');
    }
  
    try{
      //gets the calendar info for user zone
      const fullPlantingCalendar = await FullPlantingCalendar.findOne();
      const fullPlantingData = fullPlantingCalendar.toObject();
      const zone = req.user.plantingZone;
      const addedUpcoming = req.query.addedUpcoming;
      const addedPlanted = req.query.addedPlanted;
  
      //formats today's date to compare to plant ranges
      const date = new Date();
      const formattedDate = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  
  
      const zoneData = fullPlantingData[zone];
      res.render('addPlants', { user: req.user, plantingData: zoneData, dateToday: formattedDate, addedUpcoming: addedUpcoming, addedPlanted: addedPlanted });
    } catch(err) {
      console.error(err);
      res.status(500).send('Error loading full planting dates in route');
    }
  });

  router.post('/addToGarden', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.redirect('login');
    }
  
    const {name, datePlanted} = req.body;
    const id = new ObjectId();
  
    try {
      await db.collection('users').updateOne(
        {_id: req.user._id},
        {$push: {userGarden: {id, name, datePlanted}}}
      );
      console.log('Added plant to user garden')
      res.redirect(`/addPlants?addedPlanted=${encodeURIComponent(name)}`);
    } catch (err) {
      console.error(err);
      res.status(500).send("Could not add plant to garden");
    }
  });

  router.post('/addToUpcoming', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.redirect('login');
    }
  
    const {name, datePlanted} = req.body;
    const id = new ObjectId();
  
    try {
      await db.collection('users').updateOne(
        {_id: req.user._id},
        {$push: {userGarden: {id, name, datePlanted}}}
      );
      //Send plant name to page to display on success
      res.redirect(`/addPlants?addedUpcoming=${encodeURIComponent(name)}`);
    } catch (err) {
      console.error(err);
      res.status(500).send("Could not add plant to Upcoming");
    }
  });

  module.exports = router;