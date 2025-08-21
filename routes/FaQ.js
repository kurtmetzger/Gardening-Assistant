const express = require('express');
const router = express.Router();

router.get('/FaQ', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.redirect('/login');
    }
  
    try{
      res.render('FaQ', {user: req.user});
    } catch(err) {
      console.error(err);
      res.status(500).send('Error loading FaQ page');
    }
  });

  module.exports = router;