const express = require('express');
const router = express.Router();
const Theater = require("../../models/Theater");
const Movie = require("../../models/Movie");
const Seat = require("../../models/Seat");
const Reservation = require("../../models/Reservation")
const Showing = require("../../models/Showing")
var ObjectId = require("mongodb").ObjectId;

router.post("/theater/register", async (req, res) => {

    const theater = await Theater.findOne({address : req.body.address});
    
    if (theater) {
        return res.status(400).send({});
    }
    else {
        const newTheater = new Theater(req.body);
        newTheater.save().catch(err => console.log(err));
        return res.status(200).send(newTheater);
    }
})

router.post("/movie/register", async (req, res) => {
    const id = req.body.theater;
    const objectId = ObjectId(id);
    const theater = await Theater.findOne({_id : objectId});

    // if the theater exist, register the movie
    // then update the movie : Array portion of Theater document
    if (theater) {        
        var query = {address : theater.address}
        var movieIdList = theater.movie
        const newMovie = new Movie(req.body);
        movieIdList.push(newMovie._id);
        const updatedValues = {
            movie : movieIdList,
            name : theater.name,
            address : theater.address,
            screen_type : theater.screen_type,
            theater_profits : theater.theater_profits
        }
        await Theater.findOneAndUpdate(query, updatedValues);
        newMovie.save().catch(err => console.log(err));

        return res.status(200).send(newMovie);
    }
    else {
        return res.status(404).send({});
    }
})

router.post("/showing/register", async (req, res) => {
    const id = req.body.movieId;
    const objectId = ObjectId(id);
    const movie = await Movie.findById(objectId);

    if (!movie) {
        return res.status(404).send({})
    }
    else {
        const newShowing = new Showing(req.body);
        
        var query = {_id : objectId};
        var newShowingList = movie.showings
        newShowingList.push(newShowing._id); 
        var updatedValue = {
            movie_title : movie.movie_title,
            movie_image_url : movie.movie_image_url,
            movie_running_time : movie.movie_running_time,
            PG_rating : movie.PG_rating,
            release_date : movie.release_date,
            description : movie.description,
            theater : movie.theater,
            showings : newShowingList ,
            movie_profits : movie.movie_profits
        }
        await Movie.findOneAndUpdate(query, updatedValue);
        newShowing.save().catch(err => console.log(err));

        return res.status(200).send(newShowing);
    }
})

router.post("/seat/register", async (req, res) => {
    const showingId = req.body.showingId;
    const objectId = ObjectId(showingId);
    const showing = await Showing.findById(objectId);

    if (showing) {
        var query = {_id : objectId};
        var seatList = showing.seats;
        const newSeat = new Seat(req.body);
        seatList.push(newSeat._id);
        const updatedValue = {
            movieId : showing.movieId,
            date : showing.date,
            time : showing.time,
            seats : seatList
        } 
        await Showing.findOneAndUpdate (query, updatedValue);
        newSeat.save().catch(err => console.log(err));
        return res.status(200).send(newSeat);
    }
    else {
        return res.status(404).send({});
    }
})

router.get("/fetch/movie/times/:movieObjectId", async (req, res) => {
    var currentTime = new Date().toString();
    console.log(currentTime);
    var currentHour = parseInt(currentTime.substring(16, 18))
    var currentMin = parseInt(currentTime.substring(19, 21))
    console.log(currentMin);
    var availableMovieShowTimesList = []
    
    const movieId = req.params.movieObjectId;
    const objectId = ObjectId(movieId);
    const movie = await Movie.findById(objectId); // [iron man document]

    if (!movie) {
        return res.status(404).send({});
    }

    const showingsList = movie.showings // iron man's showing which is empty

    for (var i = 0; i < showingsList.length; i++) {
        var showingListString = showingsList[i];
        var showingObjectId = ObjectId(showingListString);

        const showing = await Showing.findById(showingObjectId)
        const showTime = showing.time

        var singleShowTimeNumber = parseInt(showTime.substring(0,2));
        if (singleShowTimeNumber > currentHour) {
            availableMovieShowTimesList.push(showTime);
        }
    }
    return res.status(200).send(availableMovieShowTimesList);
})

router.get("/v2/fetch/movie/times/:movieObjectId", async (req, res) =>  {
    console.log("I entered here")
    var currentTime = new Date().toString();
    var currentHour  = parseInt(currentTime.substring(16, 18)); // 13
    var currentMin = parseInt(currentTime.substring(19, 21)); // 16
    var availTime = []; // ["13:16", "13:20", "14:50"]
    var unavailTime = []; // ["9:25", "10:30", "13:10"]
    var response = []; // [{}, {}]
    var movieIdResponse = ""; // "ruueyq"

    const movieId = req.params.movieObjectId;
    const objectId = ObjectId(movieId);
    const movie = await Movie.findById(objectId);
    const showingList = movie.showings;

    for (var i = 0 ; i < showingList.length; i++) { // ["ajkljdkfj", "dsaljfkljd"]
        var showingId = showingList[i]; // "ajkljdkfj"
        var showingObjectId = ObjectId(showingId);
        var showingDocument = await Showing.findById(showingObjectId);

        movieIdResponse = showingDocument.movieId;

        var showingTime = showingDocument.time // "13:16"
        var showingHour = parseInt(showingTime.substring(0, 2)); // 14
        var showingMin = parseInt(showingTime.substring(3)); // 50

        if (showingHour < currentHour) {
            unavailTime.push(showingTime)
        }
        else {
            if (showingHour > currentHour) {
                availTime.push(showingTime)
            }
            else {
                if (showingHour == currentHour && showingMin == currentMin) {
                    availTime.push(showingTime)
                }
                else if (showingMin < currentMin) {
                    unavailTime.push(showingTime)
                }
                else {
                    availTime.push(showingTime)
                }
            }
        }
    }
    var unavailJSON = {};
    unavailJSON ["unavailable"] = unavailTime;
    unavailJSON ["movieInfo"] = movieIdResponse;
    response.push(unavailJSON);

    var availJSON = {};
    availJSON ["available"] = availTime;
    availJSON ["movieInfo"] = movieIdResponse;
    response.push(availJSON);

    return res.status(200).send(response);
})

router.get("/fetch/movies/:theater", async (req, res) => {
    const theaterId = req.params.theater;
    const objectId = ObjectId(theaterId);
    const theater = await Theater.findById(objectId);
    
    if (!theater) {
        return res.status(404).send({})
    }
    else {
        const movies = await Movie.find({theater : theaterId})
        return res.status(200).send(movies);
    }
})

// if theater does not exist return 404
// if theater exist,
// search theater to find the movie data field

router.get("/fetch/movie/:movieObjectId", async (req, res) => {
    const movieId = req.params.movieObjectId;
    const objectId = ObjectId(movieId);
    const movie = await Movie.findById(objectId);

    if (!movie) {
        return res.status(404).send({})
    }
    else {
        return res.status(200).send(movie)
    }
})

// if the movie does not exist return 404
// if the movie exist, return the movie document

router.put("/update/movie/:movieObjectId", async (req, res) => {
    const movieId = req.params.movieObjectId;
    const objectId = ObjectId(movieId);
    const movie = await Movie.findById(objectId);

    if (!movie) {
        return res.status(404).send({})
    }
    else {
        var query = {_id : objectId};
        const updatedValue = {
            movie_title : req.body.movie_title,
            movie_image_url : req.body.movie_image_url,
            movie_running_time : req.body.movie_running_time,
            PG_rating : req.body.PG_rating,
            release_date : req.body.release_date,
            description : req.body.description,
            theater : req.body.theater,
            show_time : req.body.show_time,
            movie_profits : req.body.movie_profits
        }
        await Movie.findOneAndUpdate (query, updatedValue);
        return res.status(200).send(updatedValue);
    }
})

router.post("/reserve/ticket", async (req, res) => {
    var seatReservationList = req.body.seat_reservations

    const newReservation = new Reservation(req.body)
    var showingId = ""
    for (var i = 0; i < seatReservationList.length; i++) {  // [adfdjofh, adojfhoha, adsjfhoafg]
        var seatId = seatReservationList[i];
        var seatObjectId = ObjectId(seatId);
        var seat = await Seat.findById(seatObjectId);

        var query = {_id : seatObjectId}; // [adfdjofh, adojfhoha, adsjfhoafg]
        var updatedValue = {
            showingId : seat.showingId,
            seat_number : seat.seat_number,
            isOccupied : true
        }
        await Seat.findOneAndUpdate(query, updatedValue);
        showingId = seat.showingId;
    }
    var showingObjectId = ObjectId(showingId);
    var showingDocument = await Showing.findById(showingObjectId);
    var movieId = showingDocument.movieId
    var movieObjectId = ObjectId(movieId);
    var movieDocument = await Movie.findById(movieObjectId);

    var movieProfits = movieDocument.movie_profits
    var updatedProfits = movieProfits + newReservation.total_price
    console.log("this is the updatedProfits: ", updatedProfits);

    var movieQuery = {_id : movieObjectId};
    var movieUpdatedValue = {
        movie_title : movieDocument.movie_title,
        movie_image_url : movieDocument.movie_image_url,
        movie_running_time : movieDocument.movie_running_time,
        PG_rating : movieDocument.PG_rating,
        release_date : movieDocument.release_date,
        description : movieDocument.description,
        theater : movieDocument.theater,
        showings : movieDocument.showings,
        movie_profits : updatedProfits
    }
    console.log("this is the movie_profits: ", movieUpdatedValue.movie_profits)
    await Movie.findOneAndUpdate(movieQuery, movieUpdatedValue);

    var theaterId = movieDocument.theater;
    var theaterObjectId = ObjectId(theaterId);
    var theaterDocument= await Theater.findById(theaterObjectId);
    console.log("this is the original theaterProfit: ", theaterDocument.theater_profits);
    var theaterUpdatedProfits = theaterDocument.theater_profits + newReservation.total_price
    console.log("this is the theaterUpdatedProfits: ", theaterUpdatedProfits);

    var theaterQuery = {_id : theaterObjectId};
    var theaterUpdatedValue = {
        movie : theaterDocument.movie,
        name : theaterDocument.name,
        address : theaterDocument.address,
        screen_type : theaterDocument.screen_type,
        theater_profits : theaterUpdatedProfits
    }
    await Theater.findOneAndUpdate(theaterQuery, theaterUpdatedValue);

    newReservation.save().catch(err => console.log(err));
    return res.status(200).send(newReservation);
})

router.get("/fetch/reservation/:email", async (req, res) => {
    const reservationEmail = req.params.email;
    const reservation = await Reservation.findOne({ email : reservationEmail})

    if (!reservation) {
        return res.status(404).send({})
    }
    else {
        return res.status(200).send(reservation)
    }

})

router.put("/update/reservation/:email", async (req, res) => {
    var newSeatReservationList = req.body.seat_reservations
    var oldReservationDocument = await Reservation.findOne({ email : req.params.email})
    var oldSeatReservationList = oldReservationDocument.seat_reservations // [0, 1, 2]

    for (var i = 0 ; i < oldSeatReservationList.length ; i++ ) { // [0, 1, 2]
        var oldSeatReservationId = oldSeatReservationList[i]; // [0]
        if (!newSeatReservationList.includes(oldSeatReservationId)) { // [0] is not in [1], false, and we made it true using !
            var oldSeatReservationObjectId = ObjectId(oldSeatReservationId);
            var seatDocument = await Seat.findById(oldSeatReservationObjectId)
            var seatQuery = {_id : oldSeatReservationObjectId}
            var seatUpdatedValue = {
                showingId : seatDocument.showingId,
                seat_number : seatDocument.seat_number,
                isOccupied: false
            }
            await Seat.findOneAndUpdate(seatQuery, seatUpdatedValue)
        }
        
    }
    var reservationQuery = {email : req.body.email}
    var reservationUpdatedValue = {
        email : req.body.email,
        phone_number : req.body.phone_number,
        seat_reservations : req.body.seat_reservations,
        seat_type : req.body.seat_type,
        total_price : req.body.total_price
    }
    await Reservation.findOneAndUpdate(reservationQuery, reservationUpdatedValue);
    return res.status(200).send(reservationUpdatedValue);
})

router.delete("/delete/reservation/:email", async (req, res) => {
    var deletedReservation = await Reservation.findOneAndDelete({email : req.params.email});

    if (!deletedReservation) {
        return res.status(404).send({})
    }
    
    var seatReservationList = deletedReservation.seat_reservations
    for (var i = 0; i < seatReservationList.length; i++) { // [adfjlkjf, adjojkmlf, adhiohldjf]
        var seatId = seatReservationList[i];
        var seatObjectId = ObjectId(seatId);

        var seatQuery = {_id : seatObjectId}
        var seatDocument = await Seat.findById(seatObjectId);
        var updatedSeatValue = {
            showingId : seatDocument.showingId,
            seat_number : seatDocument.seat_number,
            isOccupied: false
        }
        await Seat.findOneAndUpdate(seatQuery, updatedSeatValue)
    }
    return res.status(200).send(deletedReservation)
})

// find a document we want to delete with an email, it's going to require req.params.email
// check if the document we want to delete exist, if the document does not exist, return 404
// once we locate the Reservation document we want to delete, use findOneAndDelete mongoose API to delete the document
// make a variable for the seat_reservations so we can use for for loop
// activate for loop to iterate through seat_reservations key
// convert the strings inside the seat_reservations to objectID
// make qeury specify the _id : objectId that can be used for findOneAndUpdate
// make updatedValue that can be used for findONedAndUpdate
// we need to do findOneAndUpdate API call on the Seat document make isOccupied false after deleting the reservation
// and do return res.status(200) to get the deleted document


module.exports = router;