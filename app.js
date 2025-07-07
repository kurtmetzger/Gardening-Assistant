require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const db = mongoose.connection;
const path = require('path');

const app = express();

mongoose.connect(process.env.DATABASE_URL);
mongoose.set('strictQuery', true);
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to Database'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true}));

const registerRoutes = require('./routes/register');
app.use('/', registerRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});