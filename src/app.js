var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');

var authentication = require(path.join(__dirname, 'middleware', 'authentication'));

var refresh = require(path.join(__dirname, 'routes', 'refresh'));
var grades = require(path.join(__dirname, 'routes', 'grades'));
var spotlight = require(path.join(__dirname, 'routes', 'spotlight'));

var app = express();


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(authentication);

app.use('/refresh', refresh);
app.use('/grades', grades);
app.use('/spotlight', spotlight);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  let message = err.message;
  let error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({
    error: error,
    message: message
  })
});

module.exports = app;
