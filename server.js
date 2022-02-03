'use strict';

// setting-up the server requirements
require("dotenv").config();
const express = require('express');
const cors = require('cors');
const axios = require("axios");
const pg = require('pg');
const cli = require("nodemon/lib/cli");

// defining variables
const myPort = process.env.PORT;
const myKey = process.env.APIKEY;
const myDB_URL = process.env.DATABASE_URL;
const keyQuery = "?api_key=";
const searchQuery = "&query=";
const SpiderMan = "Spider-man";
const SpiderManID = 557;
const data = require("./Movie Data/data.json");
const trendingAPI = "https://api.themoviedb.org/3/trending/movie/day";
const searchingAPI = "https://api.themoviedb.org/3/search/movie";
const upcomingAPI = "https://api.themoviedb.org/3/movie/upcoming";
const creditsAPI = `https://api.themoviedb.org/3/movie/${SpiderManID}/credits`;

let bodyParser = require('body-parser');
let jsonParser = bodyParser.json();


//start the server 
const app = express();
app.use(cors());
const client = new pg.Client(myDB_URL);

// setting-up the get routes (requests)
app.get('/', handler);
app.get('/favorite', favoriteHandler);

app.get('/trending', trendingHandler);
app.get('/search', searchHandler);
app.get('/upcoming', upcomingHandler);
app.get('/credits', creditsHandler);

app.get('/getMovies', getMoviesFromDBHandler);
app.post('/addMovie', jsonParser, addMovieHandler);

app.put('/UPDATE/:id', jsonParser, updateMovie);
app.delete('/DELETE/:id', deleteMovie);
app.get('/getMovie/:id', getMovie);

// app.use(errorHandler);
app.use(express.json());
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
function handler(req, res) {
    let myMovies = [];
    data.allMovies.map(movie => {
        let newMovie = new Movie(movie.id, movie.title, movie.release_date, movie.poster_path, movie.overview);
        myMovies.push(newMovie);
    });
    console.log(myMovies[0]);
    return res.status(200).json(myMovies[0]);
}
// handling the get request "/favorite"
function favoriteHandler(req, res) {
    return res.status(200).send("Welcome to Favorite Page");
}
// getting trending
function trendingHandler(req, res) {
    axios.get(`${trendingAPI}${keyQuery}${myKey}`).then(result => {
        let myMovies = result.data.results;
        let movies = myMovies.map(movie => {
            return new Movie(movie.id, movie.title, movie.release_date, movie.poster_path, movie.overview);
        })
        res.status(200).json(movies);
    }).catch(err => {
        errorHandler(err, req, res);
    })
}
// searching
function searchHandler(req, res) {
    axios.get(`${searchingAPI}${keyQuery}${myKey}${searchQuery}${SpiderMan}`).then(result => {
        let myMovies = result.data.results;
        let movies = myMovies.map(movie => {
            return new Movie(movie.id, movie.title, movie.release_date, movie.poster_path, movie.overview);
        })
        res.status(200).json(movies);
    }).catch(err => {
        errorHandler(err, req, res);
    })
}
// getting upcoming
function upcomingHandler(req, res) {
    axios.get(`${upcomingAPI}${keyQuery}${myKey}`).then(result => {
        let myMovies = result.data.results;
        let movies = myMovies.map(movie => {
            return new Movie(movie.id, movie.title, movie.release_date, movie.poster_path, movie.overview);
            })
        res.status(200).json(movies);
    }).catch(err => {
        errorHandler(err, req, res);
    })
}
// searching about credits
function creditsHandler(req, res) {
    axios.get(`${creditsAPI}${keyQuery}${myKey}`).then(result => {
        let myActors = result.data.cast;
        let actors = myActors.map(actor => {
            return new Actor(actor.id, actor.name, actor.character);
        })
        res.status(200).json(actors);
    }).catch(err => {
        errorHandler(err, req, res);
    })
}
// adding a movie to the database
function addMovieHandler(req, res) {
    let movie = req.body;
    let sql = `INSERT INTO movies(title, release_date, poster_path, overview) VALUES($1, $2, $3, $4) RETURNING *;`;
    let values = [movie.title, movie.release_date, movie.poster_path, movie.overview];
    client.query(sql, values).then(data => {
        res.status(200).json(data.rows);
    }).catch(err => {
        errorHandler(err, req, res);
    });
}
// getting all movies from the database
function getMoviesFromDBHandler(req, res) {
    let sql = `SELECT * FROM movies;`;
    client.query(sql).then(data => {
        res.status(200).json(data.rows);
    }).catch(err => {
        errorHandler(err, req, res);
    });
}
// updating a specific info
function updateMovie(req, res) {
    let id = req.params.id;
    let movie = req.body;
    let sql = `UPDATE movies SET title=$1, release_date=$2, poster_path=$3, overview=$4 WHERE id=${id} RETURNING *;`;
    let values = [movie.title, movie.release_date, movie.poster_path, movie.overview];
    client.query(sql, values).then(data => {
        res.status(200).json(data.rows);
    }).catch(err => {
        errorHandler(err, req, res);
    });
}
// delete a movie 
function deleteMovie(req, res) {
    let id = req.params.id;
    let sql = `DELETE FROM movies WHERE id=${id};`;
    client.query(sql).then(() => {
        res.status(200).send(`Movie ${id} has been deleted !`);
    }).catch(err => {
        errorHandler(err, req, res);
    });
}
// gat one movie
function getMovie(req, res) {
    let id = req.params.id;
    let sql = `SELECT * FROM movies WHERE id=${id};`;
    client.query(sql).then(data => {
        res.status(200).json(data.rows);
    }).catch(err => {
        errorHandler(err, req, res);
    });
}



// error 404
function notFoundHandler(req, res) {
    return res.status(404).send("page not found !!!");
}
// error 500
function errorHandler(err, req, res) {
    console.log(err);
    res.status(500).send({
        "status": 500,
        "responseText": "Sorry, something went wrong at the server !",
        "error message": err,
    })
}
// try connecting to the DB, then run the server at the specified port
client.connect().then(() => {     // connect the DB
    app.listen(myPort, () => {    // run the server
        console.log(`listening to port: ${myPort}`);
    })    
});

