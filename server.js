'use strict';

// setting-up the server requirements
require("dotenv").config();
const express = require('express');
const cors = require('cors');
const { default: axios } = require("axios");
const app = express();
app.use(cors());

// defining variables
const myPort = process.env.PORT;
const myKey = process.env.APIKEY;
const keyQuery = "?api_key=";
const searchQuery = "&query=";
const SpiderMan = "Spider-man";
const SpiderManID = 557;
const data = require("./Movie Data/data.json");
const trendingAPI = "https://api.themoviedb.org/3/trending/movie/day";
const searchingAPI = "https://api.themoviedb.org/3/search/movie";
const upcomingAPI = "https://api.themoviedb.org/3/movie/upcoming";
const creditsAPI = `https://api.themoviedb.org/3/movie/${SpiderManID}/credits`;

// setting-up the get requests
app.get('/', handler);
app.get('/favorite', favoriteHandler);
app.get('/trending', trendingHandler);
app.get('/search', searchHandler);
app.get('/upcoming', upcomingHandler);
app.get('/credits', creditsHandler);
app.get("*", notFoundHandler);

// a constructor for the movies data
function Movie(id, title, release_date, poster_path, overview) {
    this.id = id;
    this.title = title;
    this.release_date = release_date;
    this.poster_path = poster_path;
    this.overview = overview;
}
// a constructor for the actors data
function Actor(id, name, character) {
    this.id = id;
    this.name = name;
    this.character = character;
}



// handling the get request "/"
function handler(request, response) {
    let myMovies = [];
    data.allMovies.map(movie => {
        let newMovie = new Movie(movie.id, movie.title, movie.release_date, movie.poster_path, movie.overview);
        myMovies.push(newMovie);
    });
    console.log(myMovies[0]);
    return response.status(200).json(myMovies[0]);
}
// handling the get request "/favorite"
function favoriteHandler(request, response) {
    return response.status(200).send("Welcome to Favorite Page");
}
// getting trending
function trendingHandler(request, response) {
    axios.get(`${trendingAPI}${keyQuery}${myKey}`).then(result => {
        let myMovies = result.data.results;
        let movies = [];
        myMovies.map(movie => {
            let newMovie = new Movie(movie.id, movie.title, movie.release_date, movie.poster_path, movie.overview);
            movies.push(newMovie);
        })
        response.status(200).json(movies);
    }).catch(err => {
        console.log(err);
    })
}
// searching
function searchHandler(request, response) {
    axios.get(`${searchingAPI}${keyQuery}${myKey}${searchQuery}${SpiderMan}`).then(result => {
        let myMovies = result.data.results;
        let movies = [];
        myMovies.map(movie => {
            let newMovie = new Movie(movie.id, movie.title, movie.release_date, movie.poster_path, movie.overview);
            movies.push(newMovie);
        })
        response.status(200).json(movies);
    }).catch(err => {
        console.log(err);
    })
}
// getting upcoming
function upcomingHandler(request, response) {
    axios.get(`${upcomingAPI}${keyQuery}${myKey}`).then(result => {
        let myMovies = result.data.results;
        let movies = [];
        myMovies.map(movie => {
            let newMovie = new Movie(movie.id, movie.title, movie.release_date, movie.poster_path, movie.overview);
            movies.push(newMovie);
        })
        response.status(200).json(movies);
    }).catch(err => {
        console.log(err);
    })
}
// searching about credits
function creditsHandler(request, response) {
    axios.get(`${creditsAPI}${keyQuery}${myKey}`).then(result => {
        let myActors = result.data.cast;
        let actors = [];
        myActors.map(actor => {
            let newActors = new Actor(actor.id, actor.name, actor.character);
            actors.push(newActors);
        })
        response.status(200).json(actors);
    }).catch(err => {
        console.log(err);
    })
}



// error 404
function notFoundHandler(request, response) {
    return response.status(404).send("page not found !!!");
}
// error 500
app.use(function (err, request, response, next) {
    console.error(err.stack)
    response.status(500).send(data.error500)
  })
// listening the server at port 50000
app.listen(myPort, () => {
    console.log(`listening to port: ${myPort}`);
})





