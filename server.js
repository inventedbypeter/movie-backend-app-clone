const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const consumer = require("./routes/api/consumer")
const connectDB = require("./db");

const app = express();
const port = 5000;

app.use(bodyParser.urlencoded({ extended : false}));
app.use(bodyParser.json());

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, OPTIONS, DELETE');
    next();
  });

app.use(morgan("dev"));
app.use(helmet());
connectDB();
app.use("/api/v1/consumer", consumer);

// http://localhost:5000/api/v1/consumer/theater/register
// http://localhost:5000/api/v1/consumer/movie/register
// http://localhost:5000/api/v1/consumer/showing/register
// http://localhost:5000/api/v1/consumer/seat/register
// http://localhost:5000/api/v1/consumer/fetch/movie/times/:movieObjectId
// http://localhost:5000/api/v1/consumer/v2/fetch/movie/times/:movieObjectId
// http://localhost:5000/api/v1/consumer/fetch/movies/:theater
// http://localhost:5000/api/v1/consumer/fetch/movie/:movieObjectId
// http://localhost:5000/api/v1/consumer/update/movie/:movieObjectId
// http://localhost:5000/api/v1/consumer/reserve/ticket
// http://localhost:5000/api/v1/consumer/fetch/reservation/:email
// http://localhost:5000/api/v1/consumer/update/reservation/:email
// http://localhost:5000/api/v1/consumer/delete/reservation/:email


app.listen(port, () => console.log(`API Server Listening on port ${port}`));
