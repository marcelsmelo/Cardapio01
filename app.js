var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var mongoose    = require('mongoose');
var Busboy = require('busboy');
var fs = require('fs');

//FIXME Retirar exemplo de upload de imagem do arquivo app.js e mover para companycontroller
var multer = require('multer');
var uploaded = multer({ dest: 'uploads/' });

var app = express();
var load = require('express-load');

/**************************
 **** BANCO DE DADOS *****
 *************************/
const connection = require('./config/db.js')(mongoose);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
//FIXME avaliar se o sistema funciona sem o bodyParser
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));


/**********************
 ******** ROTAS *******
 **********************/
load('controllers')
    .then('routes')
    .into(app);

//FIXME Retirar exemplo de upload de imagem do arquivo app.js e mover para companycontroller
app.get('/upload', function(req, res){
  res.sendFile('/upload.html', {root: __dirname });
});

// Post files
app.post('/upload', uploaded.any(),  function(req, res) {
  console.log('FILES', req.files);
  console.log('BODY', req.body);
});

//FIXME Retirar exemplo de upload de imagem do arquivo app.js e mover para companycontroller
//FIXME deixar apenas o Multer
app.get('/upload2', function(req, res){
  res.sendFile('/upload2.html', {root: __dirname });
});

app.post('/upload2', function(req, res){
  console.log('TESTE', req.body);
  var busboy = new Busboy({ headers: req.headers });
    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
      var saveTo = path.join('uploads2/', path.basename(fieldname));
      file.pipe(fs.createWriteStream(saveTo));
    });
    busboy.on('finish', function() {
      res.writeHead(200, { 'Connection': 'close' });
      res.end("That's all folks!");
    });
    return req.pipe(busboy);
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500)
    .json({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {g
  res.status(err.status || 500)
  .json({
    message: err.message,
    error: err
  });
});


module.exports = app;
