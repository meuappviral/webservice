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

app.get('/listar/:idReferencia?/:quantidade?', function (req, res) {
	res.type('application/json');
	var obj = JSON.parse(fs.readFileSync('movies.json', 'utf8'));
	var lista = obj.lista.reverse();
	
	if(req.params.idReferencia) {
		var quantidade = req.params.quantidade ? parseInt(req.params.quantidade) : 50;
		quantidade *= -1;
		var posicaoInicial = findPosition(lista, req.params.idReferencia);
		var posicaoFinal = posicaoInicial + quantidade;
			
		if(posicaoFinal < posicaoInicial) {
			var tmp = posicaoInicial;
			posicaoInicial = posicaoFinal;
			posicaoFinal = tmp;
		}
		lista = lista.slice(posicaoInicial, posicaoFinal);
	}
	
	res.end(JSON.stringify(lista));
});

function findPosition(lista, id) {
	var indice = -1;
	lista.forEach(function(val, i) {
		if(val.id == id)
			return indice = i;
	});
	return indice;
}

app.get('/enviar', function (req, res){
    res.render('upload');
});

app.post('/enviar', upload.single('file'), function (req, res, next) {
	
	var obj, msg;
	fs.readFile('movies.json', 'utf8', function (err, data) {
	  if (err) throw err;
	  msg = req.body.msg;
	  obj = JSON.parse(data);
	  console.log(req.file.filename + ' - ' + msg);
	  obj.lista.push({id:obj.indice++, title:msg, path:req.file.path, image:'http://'+BASE_PATH+':'+BASE_PORT+"/imagens/"+req.file.filename, rating:8.2,releaseYear:2010,genre:["Animation","Adventure","Family"]});
		console.log(obj);
		fs.writeFile('movies.json', JSON.stringify(obj), function (err) {
		  if (err) throw err;
		  console.log('It\'s saved!');
		});
	  });
  res.end('uploaded');
})

app.get('/excluir/:id', function (req, res){
    fs.readFile('movies.json', 'utf8', function (err, data) {
	  if (err) throw err;
	  obj = JSON.parse(data);
	  
	  obj.lista.forEach(function(val, i){
		  if(val.id == req.params.id) {
			console.log(val.path);
			fs.unlink(val.path);
			obj.lista.splice(i, 1);
			return;
		  }  
	  });
	  
		fs.writeFile('movies.json', JSON.stringify(obj), function (err) {
		  if (err) throw err;
		  console.log('It\'s saved!');
		});
	  });
	  res.end('Excluído!');
});

var server = app.listen(app.get('port') ,app.get('ip'), function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});