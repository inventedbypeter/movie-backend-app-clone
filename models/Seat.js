const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SeatSchema = new Schema({
    showingId : String,
    seat_number : String,
    isOccupied: Boolean
})

module.exports = mongoose.model('Seat', SeatSchema);