var BASE_PATH = "127.0.0.1";
var BASE_PORT = 3002;

var path = require('path');
var express = require('express');
var multer  = require('multer')
var upload = multer({ dest: 'imagens/' })
var fs = require('fs');
var app = express();

app.set('port', process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || BASE_PORT);
app.set('ip', process.env.OPENSHIFT_NODEJS_IP || BASE_PATH);
app.set('view engine', 'ejs');

express.static.mime.default_type = "image/jpeg";
app.use('/imagens', express.static(__dirname + '/imagens'));

app.get('/', function (req, res) {
	res.type('application/json');
	res.sendFile(path.join(__dirname + '/movies.json'), {headers: {
        'Content-Type': 'Application/json'
	}});
});

app.get('/upload', function (req, res){
    res.render('upload');
});

app.post('/upload', upload.single('file'), function (req, res, next) {
	
	var obj, msg;
	fs.readFile('movies.json', 'utf8', function (err, data) {
	  if (err) throw err;
	  msg = req.body.msg;
	  obj = JSON.parse(data);
	  console.log(req.file.filename + ' - ' + msg);
	  obj.push({title:msg, image:'http://'+BASE_PATH+':'+BASE_PORT+"/imagens/"+req.file.filename, rating:8.2,releaseYear:2010,genre:["Animation","Adventure","Family"]});
		console.log(obj);
		fs.writeFile('movies.json', JSON.stringify(obj), function (err) {
		  if (err) throw err;
		  console.log('It\'s saved!');
		});
	  });
  res.end('uploaded');
})

var server = app.listen(app.get('port') ,app.get('ip'), function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});