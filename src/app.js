/**
 * Creates the main express app object.
 * Mounts all routers.
 * Configures middleware and logging.
 * Connects to database.
 * @module app
 */
const express = require('express');
const path = require('path');
const requestLogger = require('morgan');
const logger = require('winston');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const compression = require('compression');
const helmet = require('helmet');
const mongoose = require('mongoose');
const Promise = require('bluebird');

mongoose.Promise = Promise;

if (process.env.NODE_ENV === 'production') {
  logger.configure({
    transports: [
      new(logger.transports.File)({
        filename: 'production.log'
      })
    ]
  });
}


const refresh = require(path.join(__dirname, 'routes', 'refresh'));
const assignments = require(path.join(__dirname, 'routes', 'assignments'));
const coursepage = require(path.join(__dirname, 'routes', 'coursepage'));
const grades = require(path.join(__dirname, 'routes', 'grades'));
const faculty = require(path.join(__dirname, 'routes', 'faculty'));
const home = require(path.join(__dirname, 'routes', 'home'));
const hostel = require(path.join(__dirname, 'routes', 'hostel'));
const late = require(path.join(__dirname, 'routes', 'late'));

const authentication = require(path.join(__dirname, 'middleware', 'authentication'));

const app = express();

app.use(requestLogger('short'));
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(expressValidator());
app.use(compression());

mongoose.connect('mongodb://localhost/student', { 
  useMongoClient: true
})
  .then(_ => {
    logger.info('Connected to MongoDB instance.');
  })
  .catch(err => logger.error('Unable To connect to MongoDB.', err.stack));;

  app.use('/student', authentication);

function onlyVellore(req, res, next) {
  if (req.body.campus !== 'vellore') {
    const err = new Error(`This feature is not supported for the requested \`campus\`.`);
    err.status = 400;
    return next(err);
  } else {
    return next();
  }
}

// Routes
app.use('/student/refresh', refresh);
app.use('/student/assignments', assignments);

// app.use('/student/coursepage', coursepage);
app.use('/student/grades', grades);
app.use('/student/home', home);

app.use('/student/hostel', onlyVellore);
app.use('/student/hostel', hostel);

app.use('/student/late', onlyVellore);
app.use('/student/late', late);

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
  const status = err.status || 500;
  if (Math.floor(status / 100) === 5) {
    logger.error(`An error occurred (HTTP status ${status})`, err.stack);
  }
  res.status(status);
  res.json({
    error: error,
    message: message
  })
});



module.exports = app;
