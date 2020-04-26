const util = require('util');
const fs = require('fs');
const readFile = util.promisify(fs.readFile)
const express = require('express');
const cors = require('cors');
var app = express();
app.use(cors()); // enable cors

app.get('/', function(req, res){
    readFile("data/JSONout-cat.json")
    //readFile("data/test.json")
    .then(raw  => {
      var jsonTuples = JSON.parse(raw);
      console.log("here");
      console.log(jsonTuples);
      res.send(jsonTuples)
    })
    .catch( e => { console.log(e) });
  });

  app.get('/expert', function(req, res){
    readFile("data/expert-ranking.html")
    .then(raw  => {
      res.send(raw)
    })
    .catch( e => { console.log(e) });
  });

  app.get('/user', function(req, res){
    readFile("data/nonexpert-ranking.html")
    .then(raw  => {
      res.send(raw)
    })
    .catch( e => { console.log(e) });
  });

  app.listen(8080, function() {
    console.log("Security Data Server is running at localhost: 8080")
  });
