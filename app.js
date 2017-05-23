require('newrelic');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var helmet = require('helmet')
require('dotenv').config();

var mongoose = require('mongoose');
require('./models/Goods');
require('./models/Users');
require('./models/Purchases');
require('./config/passport');

mongoose.connect('mongodb://localhost/market');
// mongoose.connect('mongodb://'+process.env.MLAB_USER+':'+process.env.MLAB_PW+'@ds131320.mlab.com:31320/farmers-market');

var passport = require('passport');

var routes = require('./controllers/index');
// var users = require('./routes/users');

// console.log(routes);

var app = express();


// use helmet for security headers
// https://helmetjs.github.io/docs/
app.use(helmet());
// app.use('/api', jwt({secret: process.env.JWT_SECRECT, userProperty: 'payload'}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize());
app.use('/', routes);

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
  console.log('hey');
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
