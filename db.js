const mongoose = require('mongoose');
const uri = 'mongodb+srv://peterpark:hackercrunch1@cluster0.d1lc9.mongodb.net/doordash?retryWrites=true&w=majority';

const connectDB = async () => {
    await mongoose.connect (uri, {
        useUnifiedTopology : true,
        useNewUrlParser : true
    })
    console.log("mongodb has successfully connected");
}

module.exports = connectDB;

