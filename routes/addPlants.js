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

      //Converts into array for sorting
        let plantArray = Object.entries(fullPlantingData[zone] || {});

        if (req.user.addPlantsSort === 'date') {
        //Redefines built in sort method logic by explaining how a and b should be compared.
            plantArray.sort((a, b) => {
            //Gets date from element a, then date from element b in sorting. Adds '-' if no data exists for spring planting
            const aDate = a[1].plantOutdoorsStart || "-";
            const bDate = b[1].plantOutdoorsStart || "-";
            // Puts plants without spring planting dates (Garlic) at the bottom because negative results go later
            if (aDate === "-") return 1;
            if (bDate === "-") return -1;
            //Seperates by month and day and converts into comparable numbers
            const aMonth = Number(aDate.split("-")[0])
            const aDay = Number(aDate.split("-")[1])
            const bMonth = Number(bDate.split("-")[0])
            const bDay = Number(bDate.split("-")[1])
            //If months are different, return difference. Otherwise, return difference of days
            if (aMonth !== bMonth) return aMonth - bMonth;
            return aDay - bDay;
            });
        }
  
  
      const zoneData = fullPlantingData[zone];
      res.render('addPlants', { user: req.user, plantingData: plantArray, dateToday: formattedDate, addedUpcoming: addedUpcoming, addedPlanted: addedPlanted });
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