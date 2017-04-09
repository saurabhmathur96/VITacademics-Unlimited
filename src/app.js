const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const compression = require('compression');



const refresh = require(path.join(__dirname, 'routes', 'refresh'));
const grades = require(path.join(__dirname, 'routes', 'grades'));
const faculty = require(path.join(__dirname, 'routes', 'faculty'));
const home = require(path.join(__dirname, 'routes', 'home'));
const hostel = require(path.join(__dirname, 'routes', 'hostel'));

const authentication = require(path.join(__dirname, 'middleware', 'authentication'));

let app = express();


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(compression());

app.use('/student', authentication);
app.use('/student/refresh', refresh);
app.use('/student/grades', grades);
app.use('/student/home', home);
app.use('/student/hostel', hostel);
app.use('/faculty', faculty);



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

  // console.error(err.stack)
  res.status(err.status || 500);
  res.json({
    error: error,
    message: message
  })
});





module.exports = app;
