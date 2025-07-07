require('dotenv').config();
const registerRouter = require('./routes/api/register')
const express = require('express')
const mongoose = require('mongoose')
const db = mongoose.connection
const PORT = process.env.PORT || 5010
const app = express()
app.use('/Gardening-Assistant', registerRouter)
app.use(express.json())
mongoose.connect(process.env.DATABASE_URL)
mongoose.set('strictQuery', true)
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to Database'))
app.listen(PORT, () => console.log(`Server started on port ${PORT}`))


app.get('/', (req, res) => {
    res.send('Welcome to the Gardening App!');
  });