const mongoose = require('mongoose');
const uri = 'mongodb+srv://inventedbypeter:peter123@cluster0.xf3q9.mongodb.net/movies?retryWrites=true&w=majority';

const connectDB = async () => {
    await mongoose.connect (uri, {
        useUnifiedTopology : true,
        useNewUrlParser : true
    })
    console.log("mongodb has successfully connected");
}

module.exports = connectDB;

