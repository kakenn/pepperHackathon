var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var port = process.env.PORT || 5010;
var NCMB = require("ncmb");
var ncmb = new NCMB("07f9eb21dd8db1dc715c77d272561004dd1941a3adc961f6d4e51d649d85922f", "ad947567899b91be5982e7102f0723b477087d401d2d4eb2e71d12f324be8011");

var TwilioData = ncmb.DataStore("twilioData");

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.post('/setVoice', function(req, res){
  var data = new TwilioData({
    url: req.param('RecordingUrl'),
    time: req.param('RecordingDuration')
  });
  data.save().then(function(data){
    console.log(data);
  }).catch(function(err){
    console.log(err);
  });
  res.sendFile(__dirname + '/public/finish.xml');
});
app.listen(port);
console.log("surver running at localhost:" + port);

