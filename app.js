//Require packages
require("dotenv").config();
const ejs = require("ejs");
const express = require("express");
const mongoose = require("mongoose");

//setup Mongoose
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://localhost:27017/growTogetherDB');
};

//declare an Express application
const app = express();

//Use express.static to serve static files.
app.use(express.static("public"));

//set the view engine to use ejs.
app.set('view engine', 'ejs');

//render the home page.
app.get("/", function(req, res){
  res.render("home");
})


//run the app on port 3000 locally.
app.listen(3000, function(req, res){
  console.log("Server successfully started on port 3000.");
});
