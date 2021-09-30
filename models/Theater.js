const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TheaterSchema = new Schema({
    movie : Array,
    name : String,
    address : String,
    screen_type : Array,
    theater_profits : Number
})

module.exports = mongoose.model('Theater', TheaterSchema);