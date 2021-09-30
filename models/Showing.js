const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ShowingSchema = new Schema({
    movieId : String,
    date : String,
    time : String,
    seats : Array
})

module.exports = mongoose.model('Showing', ShowingSchema);