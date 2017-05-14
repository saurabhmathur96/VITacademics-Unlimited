const express = require('express');
const path = require('path');
const requestLogger = require('morgan');
const logger = require('winston');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const compression = require('compression');
const helmet = require('helmet');

if (process.env.NODE_ENV === 'production') {
  logger.configure({
    transports: [
      new (logger.transports.File)({ filename: 'production.log' })
    ]
  });
}


const refresh = require(path.join(__dirname, 'routes', 'refresh'));
const assignments = require(path.join(__dirname, 'routes', 'assignments'));
const grades = require(path.join(__dirname, 'routes', 'grades'));
const faculty = require(path.join(__dirname, 'routes', 'faculty'));
const home = require(path.join(__dirname, 'routes', 'home'));
const hostel = require(path.join(__dirname, 'routes', 'hostel'));

const authentication = require(path.join(__dirname, 'middleware', 'authentication'));

let app = express();


app.use(requestLogger('short'));
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(compression());

app.use('/student', authentication);
app.use('/student/refresh', refresh);
app.use('/student/assignments', assignments);
app.use('/student/grades', grades);
app.use('/student/home', home);
app.use('/student/hostel', hostel);
app.use('/faculty', faculty);



// catch 404 and forward to error handler
app.use((req, res, next) => {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  const message = err.message;
  const error = req.app.get('env') === 'development' ? err : {};

  logger.error(`An error occurred (HTTP status ${err.status || 500})`, err.stack);

  res.status(err.status || 500);
  res.json({
    error: error,
    message: message
  })
});





module.exports = app;
