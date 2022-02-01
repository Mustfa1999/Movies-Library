'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
// first require pg 
const pg = require('pg');

// second go and create a database in your postgress (ununtu):
// psql 
// CREATE DATABASE dbName;

// third step
// create a client with the db URL
// DATABASE_URL=postgres://username:password@localhost:5432/databaseName
const client = new pg.Client(process.env.DATABASE_URL);



const PORT = process.env.PORT;

const server = express();
server.use(cors());
server.use(express.json()); // whenever you read from the body please parse it to a json format 

server.get('/',handleHomePage);
server.get('/recipes',recipesHandler);
server.get('/searchRecipes',searchRecipesHandler);

server.post('/addFavRecipes',addFavRecipesHandler);
server.get('/myFavRecipes',myFavRecipesHandler);


server.use('*',notFoundHandler);
server.use(errorHandler)


function Recipe(id, title, readyInMinutes, summary, vegetarian, instructions, sourceUrl, image){
    this.id = id;
    this.title = title;
    this.readyInMinutes = readyInMinutes;
    this.summary = summary;
    this.vegetarian = vegetarian;
    this.instructions = instructions;
    this.sourceUrl = sourceUrl;
    this.image = image;
}
let numberOfRecipes=5;
// let userSearch = "pasta"; // an input from the user 
let url = `https://api.spoonacular.com/recipes/random?apiKey=${process.env.APIKEY}&number=${numberOfRecipes}`;

function handleHomePage(req,res){
    res.status(200).send("Welcome :) ");
}
function recipesHandler(req,res){
    let newArr = [];
    axios.get(url)
     .then((result)=>{
        result.data.recipes.forEach(recipe =>{
            newArr.push(new Recipe(recipe.id,recipe.title,recipe.readyInMinutes,recipe.summary,recipe.vegetarian,recipe.instructions,recipe.sourceUrl,recipe.image));
        })
        res.status(200).json(newArr);

    }).catch((err)=>{
        errorHandler(err,req,res);
    })
}
function searchRecipesHandler(req,res){
    let userSearch = req.query.userSearch;
    // let fat = req.query.fat;
    console.log(userSearch);
    // console.log(fat);

    let url = `https://api.spoonacular.com/recipes/random?apiKey=${process.env.APIKEY}&number=${numberOfRecipes}&query=${userSearch}`; 

    axios.get(url)
    .then(result=>{
        let recipes = result.data.recipes.map(recipe =>{
            return new Recipe(recipe.id,recipe.title,recipe.readyInMinutes,recipe.summary,recipe.vegetarian,recipe.instructions,recipe.sourceUrl,recipe.image);
        });
        res.status(200).json(recipes);  
     }).catch(err=>{
        errorHandler(err,req,res);
    })
}
function addFavRecipesHandler(req,res){
  const recipe = req.body;
//   console.log(recipe)
  let sql = `INSERT INTO favRecipes(title,readyInMinutes,summary,vegetarian,instructions,sourceUrl) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *;`
  let values=[recipe.title,recipe.readyInMinutes,recipe.summary,recipe.vegetarian,recipe.instructions,recipe.sourceUrl];
  client.query(sql,values).then(data =>{
      res.status(200).json(data.rows);
  }).catch(error=>{
      errorHandler(error,req,res)
  });
}
function myFavRecipesHandler(req,res){
    let sql = `SELECT * FROM favRecipes;`;
    client.query(sql).then(data=>{
       res.status(200).json(data.rows);
    }).catch(error=>{
        errorHandler(error,req,res)
    });
}




function notFoundHandler(req,res){
   res.status(404).send("This page is not found")
}
function errorHandler (error,req,res){
   const err = {
        status : 500,
        messgae : error
    }
    res.status(500).send(err);
}
// fourth is connecting the client 
client.connect().then(()=>{
    server.listen(PORT,()=>{
        console.log(`listining to port ${PORT}`)
    })
})
