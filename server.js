'use strict';

// setting-up the server requirements
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors())

// fetching the data
const data = require("./Movie Data/data.json");

// setting-up the get requests
app.get('/', handler);
app.get('/favorite', favoriteHandler);
app.get("*", notFoundError);


// a constructor for the movies data
function Movie(title, poster_path, overview) {
    this.title = title;
    this.poster_path = poster_path;
    this.overview = overview;
}

// handling the get request "/"
function handler(request, response) {
    let myMovies = [];
    data.allMovies.map(movie => {
        let newMovie = new Movie(movie.title, movie.poster_path, movie.overview);
        myMovies.push(newMovie);
    });
    console.log(myMovies[0]);
    return response.status(200).json(myMovies[0]);
}

// handling the get request "/favorite"
function favoriteHandler(request, response) {
    return response.status(200).send("Welcome to Favorite Page");
}

// error 404
function notFoundError(request, response) {
    return response.status(404).send("page not found !!!");
}

// error 500
app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send(data.error500)
  })

// activating the server at port 50000
let usedPort = 30000;
app.listen(usedPort, () => {
    console.log("listening to port: " + usedPort);
})



