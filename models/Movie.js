const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MovieSchema = new Schema({
    movie_title : String,
    movie_image_url : String,
    movie_running_time : String,
    PG_rating : String,
    release_date : String,
    description : String,
    theater : String,
    showings : Array,
    movie_profits : Number
})

module.exports = mongoose.model('Movie', MovieSchema);