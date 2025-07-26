const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const fullPlantingCalendarSchema = new mongoose.Schema({}, {strict: false});

module.exports = mongoose.model('fullPlantingCalendar', fullPlantingCalendarSchema, 'full_planting_calendar')