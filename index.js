var path = require('path');
var express = require('express');
var app = express();

app.set('port', process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 3002);
app.set('ip', process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1");

app.get('/', function (req, res) {
	res.type('application/json');
	res.sendFile(path.join(__dirname + '/movies.json'), {headers: {
        'Content-Type': 'Application/json'
	}});
});

var server = app.listen(app.get('port') ,app.get('ip'), function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});