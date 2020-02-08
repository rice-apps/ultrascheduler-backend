require("../db");

var express = require("express");
var app = express();
var path = require("path");
var bodyParser = require("body-parser");
var db;



const updateDB = function(jsonObj) {
    // given a json object, update the mongo database with the json data
    // jsonObj is of the form

}






app.use(bodyParser.json());

app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "/myfile.html"));
});

app.post("/", function(req, res) {
  // Insert JSON straight into MongoDB
  db.collection("employees").insert(req.body, function(err, result) {
    if (err) res.send("Error");
    else res.send("Success");
  });
});
