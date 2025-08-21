const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const db = mongoose.connection;
const { User } = require('../models/user');

router.get('/profileOptions', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.redirect('login');
    }
  
    try{
      res.render('profileOptions', {user: req.user});
    } catch(err) {
      console.error(err);
      res.status(500).send('Error loading profile options');
    }
  });

  router.post("/tableSortUpdate", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.redirect("/login");
    }
  
    const userId = req.user._id;
    const { addPlantsSort, UpcomingSort } = req.body;
  
    try {
      await User.findByIdAndUpdate(
        userId,
        {
          $set: {addPlantsSort: addPlantsSort || "name", upcomingSort: UpcomingSort || "name"
          }
        },
        {new: true, upsert: true} //If setting doesn't exist in user, create it.
      );
  
      res.redirect("/profileOptions");
    } catch (err) {
      console.error(err);
      res.status(500).send("Error saving sorting prefferences");
    }
  });

module.exports = router;
