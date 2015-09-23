var express = require('express');
var app = express();
var request = require('request');
var bodyParser = require('body-parser');
var port = process.env.PORT || 5010;
var NCMB = require("ncmb");
var ncmb = new NCMB("07f9eb21dd8db1dc715c77d272561004dd1941a3adc961f6d4e51d649d85922f", "ad947567899b91be5982e7102f0723b477087d401d2d4eb2e71d12f324be8011");

var twitter = require('twitter');

var twit = new twitter({
    consumer_key: 'BhSjo0W2dcpR848k9L5VHzIbM',
    consumer_secret: 'Q66VRmRJinbC5FUIb2bA6m8b9a01gKa97sE4eXUhVBolsJTvHZ',
    access_token_key: '83377382-KHQQdk8lIEQUOjoLSc52LTerCQz8KUVxjIdnJVRdE',
    access_token_secret: 'TkEDF48SCugIi2ihO0jpNkoFhlTn0Oh4yHUKsBEBV2k4i'
});

var TwilioData = ncmb.DataStore("twilioData");
var Topic = ncmb.DataStore("topic");
var TopicPost = ncmb.DataStore("topicPost");
var Word = ncmb.DataStore("word");

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.listen(port);
console.log("surver running at localhost:" + port);


/*
  音の登録
*/
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



/*
  トピックの登録
*/
app.get('/createTopic', function(req, res){
  if(req.param('title')){
    var data = new Topic({
      title: req.param('title'),
    });
    data.save().then(function(data){
      res.send('{status:"success"}');
    }).catch(function(err){
      res.send('{status:"false"}');
    });
  }else{
    res.send('{status:"false"}');
  }
});


/*
  トピックへの投稿
*/
app.get('/createTopicPost', function(req, res){
  if(req.param('text') && req.param('userId') && req.param('topicId')){
    var data = new TopicPost({
      topic: req.param('topicId'),
      user: req.param('userId'),
      text: req.param('text')
    });
    data.save().then(function(data){
      res.send('{status:"success"}');
    }).catch(function(err){
      res.send('{status:"false"}');
    });
  }else{
    res.send('{status:"false"}');
  }
});


/*
  トピックの取得
*/
app.get('/topicList', function(req, res){
  var limit = req.param('limit') || 30;
  Topic.limit(limit).order("createDate",true).fetchAll().then(function(results){
    res.send(JSON.stringify({status:"success", records:results}));
  }).catch(function(err){
    res.send('{status:"false"}');
  });
});


/*
  トピック投稿の取得
*/
app.get('/topicListPost', function(req, res){
  if(req.param('topicId')){
    var limit = req.param('limit') || 30;
    TopicPost.equalTo("topic", req.param('topicId')).limit(limit).order("createDate",true).req.param('topicId').fetchAll().then(function(results){
      res.send(JSON.stringify({status:"success", records:results}));
    }).catch(function(err){
      res.send('{status:"false"}');
    })
  }else{
    res.send('{status:"false"}');
  }
});


/*
  ワードの取得
*/
app.get('/wordList', function(req, res){
  var limit = req.param('limit') || 10;
  Word.limit(limit).order("createDate",true).req.param('topicId').fetchAll().then(function(results){
    res.send(JSON.stringify({status:"success", records:results}));
  }).catch(function(err){
    res.send('{status:"false"}');
  })
});



/*
  トレンドの取得(東京)
*/
app.get('/listTrend', function(req, res){
  twit.get('trends/place', {id:1118370}, function(err,obj,raw) {
    if(!err){
      obj = obj[0].trends.filter(function(item) {
        return !item.name.match(/^#/);
      });
      var tasks = [];
      obj = obj.map(function(index, elem) {
        tasks.push(getTextCategory(index.name));
        return index;
      });
      Promise.all(tasks).then(function(results) {
        res.send(results);
      });
    }else{
      console.log(err);
      res.send(err);
    }
  });
});


function getTextCategory(text){
  return new Promise(function(resolve,reject) {
    request.post( {
      url: 'https://api.apigw.smt.docomo.ne.jp/truetext/v1/clusteranalytics?APIKEY=794a516d62614f5278686e5849554b7a5a33514e73627a2f717a47346136437a38456a374156504e55752f',
      form: {text:text},
      json: true
    }, function (error, response, body) {
      if (!error && !body["requestError"]) {
        resolve(body);
      } else {
        resolve({});
      }
    });
  });
}
