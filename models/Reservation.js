const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReservationSchema = new Schema({
    email : String,
    phone_number : String,
    seat_reservations : Array,
    seat_type : String,
    total_price : Number
})

module.exports = mongoose.model('Reservation', ReservationSchema);