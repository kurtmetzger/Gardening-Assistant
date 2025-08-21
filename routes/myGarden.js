const express = require('express');
const router = express.Router();
const FullPlantingCalendar = require('../models/fullPlantingCalendar');
const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const db = mongoose.connection;

router.get('/', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }

    try{
        //gets the calendar info for user zone
        const fullPlantingCalendar = await FullPlantingCalendar.findOne();
        const fullPlantingData = fullPlantingCalendar.toObject();
        const zone = req.user.plantingZone;
    
        //formats today's date to compare to plant ranges
        const date = new Date();
        const formattedDate = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        
            //Same code as add plants page, but just grabs items where they are in upcoming
        let upcomingArray = req.user.userGarden.filter(plant => plant.datePlanted === "0");

        if (req.user.upcomingSort === 'date') {
        //Redefines built in sort method logic by explaining how a and b should be compared.
            upcomingArray.sort((a, b) => {
            //Gets date from element a, then date from element b in sorting. Adds '-' if no data exists for spring planting
            const aDate = fullPlantingData[zone][a.name].plantOutdoorsStart || "-";
            const bDate = fullPlantingData[zone][b.name].plantOutdoorsStart || "-";
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
        } else{
            //This one needs to be sorted alphabetically, but the master plants list is automatically
            upcomingArray.sort((a, b) => a.name.localeCompare(b.name));
        }
    
    
        const zoneData = fullPlantingData[zone];
        res.render('myGarden', { user: req.user, plantingData: zoneData, upcomingArray: upcomingArray, dateToday: formattedDate });
      } catch(err) {
        console.error(err);
        res.status(500).send('Error loading myGarden page');
      }
});

router.post('/plantFromUpcoming', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.redirect('login');
    }
  
    const userId = req.user._id;
    const {id} = req.body;
    const today = new Date().toISOString().slice(0, 10);
  
    try {
      await db.collection('users').updateOne(
        { _id: userId, 'userGarden.id': new ObjectId(id), 'userGarden.datePlanted': "0" },
        { $set: { 'userGarden.$.datePlanted': today } }
      );
      res.redirect('/');
    } catch (err) {
      console.error('Error updating plant date:', err);
      res.status(500).send('Could not update plant date');
    }
  });

  router.post('/updatePlantingDate', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.redirect('login');
    }
  
    const userId = req.user._id;
    const {id, datePlanted} = req.body;
  
    try {
      await db.collection('users').updateOne(
        { _id: userId, 'userGarden.id': new ObjectId(id)},
        { $set: { 'userGarden.$.datePlanted': datePlanted } }
      );
      res.redirect('/');
    } catch (err) {
      console.error('Error updating plant date:', err);
      res.status(500).send('Could not update plant date');
    }
  });

  router.post('/removePlant', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.redirect('login');
    }
  
    const userId = req.user._id;
    const {id} = req.body;
  
    try {
      await db.collection('users').updateOne(
        {_id: userId},
        {$pull: {userGarden: {id: new ObjectId(id)}}}
      );
      res.redirect('/');
    } catch (err) {
      console.log(id)
      console.error('Error removing plant:', err);
      res.status(500).send('Could not remove plant');
    }
  });

module.exports = router;