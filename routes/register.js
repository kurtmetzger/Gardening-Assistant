const express = require('express');
const bcrypt = require('bcrypt');
const { User, validate } = require('../models/user');
const router = express.Router();

router.get('/register', (req, res) => {
    res.render('register');
});

router.post('/register', async (req, res) => {
    //Excludes password retype when trying to validate
    const {error} = validate({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    });
    if (error) {
        return res.render('register', {error: error.details[0].message});
    }

    if (req.body.password !== req.body.retypePassword) {
        return res.render('register', {error: 'Passwords do not match'});
    }

    let user = await User.findOne({ email: req.body.email });
    if (user) {
        return res.render('register', {error: 'User already exists'});
    }

    try {
        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            plantingZone: "0",
            upcomingSort: "name",
            addPlantsSort: "name"
        });

        const registeredUser = await User.register(newUser, req.body.password);

        req.login(registeredUser, err => {
            if (err) return next (err);
            res.redirect('/')
        })
    } catch (err) {
        res.status(400).send(err.message);
    }
});

module.exports = router;