const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose    = require('mongoose');
const fs = require('fs');
const cors = require('cors');

let fileStreamRotator = require('file-stream-rotator');

let app = express();
const load = require('express-load');

//==========================================================
//================= Banco de Dados =========================
//==========================================================
const connection = require('./config/db.js')(mongoose);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

//==========================================================
//============== Configure logs to File ====================
//==========================================================
// const logDirectory = path.join(__dirname, 'logs');
// // ensure log directory exists
// fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)
// // create a rotating write stream
// const accessLogStream = fileStreamRotator.getStream({
//   date_format: 'YYYYMMDD',
//   filename: path.join(logDirectory, 'access-%DATE%.log'),
//   frequency: 'daily',
//   verbose: false
// });
// app.use(logger('common', {stream: accessLogStream}));

 app.use(logger('dev'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
//FIXME avaliar se o sistema funciona sem o bodyParser
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const enableCors = require('./lib/enableCORS.js');
app.use(enableCors);
//app.use(cors());

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

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
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
