var express = require('express');
var app = express();
var port = process.env.PORT || 5010;

app.use(express.static('public'));

app.listen(port);
console.log("surver running at localhost:" + port);
