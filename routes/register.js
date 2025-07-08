const express = require('express');
const bcrypt = require('bcrypt');
const { User, validate } = require('../models/user');
const router = express.Router();

router.get('/register', (req, res) => {
    res.render('register');
});

router.post('/register', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send('User already exists');

    try {
        const newUser = new User({
            name: req.body.name,
            email: req.body.email
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