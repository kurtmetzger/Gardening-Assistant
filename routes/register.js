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

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    user = new User({
        name: req.body.name,
        email: req.body.email,
        passowrd: hashedPassword
    });

    await user.save();
    res.send('User registered successfully')
});

module.exports = router;