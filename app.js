const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose    = require('mongoose');

global.logger = require('winston');
logger.remove(logger.transports.Console)
logger.add(logger.transports.Console, {colorize:true });
logger.level ='debug';

const cors = require('cors');

let app = express();
const load = require('express-load');

//==========================================================
//================= Banco de Dados =========================
//==========================================================
mongoose.Promise = global.Promise;
const connection = require('./config/db.js')(mongoose);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

//==========================================================
//============== Configure logs to File ====================
//==========================================================
//let fileStreamRotator = require('file-stream-rotator');
//const fs = require('fs');
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

//app.use(morgan('dev'));
app.use(morgan(':date[clf] - :method :url :status :response-time ms - :res[content-length]'))

app.use(cookieParser());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
//app.use(express.static(path.join(__dirname, 'public')));

//const enableCors = require('./lib/enableCORS.js');
//app.use(enableCors);
app.use(cors());

/**********************
 ******** ROTAS *******
 **********************/
load('controllers')
    .then('routes')
    .into(app);

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
