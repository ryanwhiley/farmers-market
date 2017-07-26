var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var helmet = require('helmet');
var fileUpload = require('express-fileupload');
require('dotenv').config();

var mongoose = require('mongoose');
require('./models/Goods');
require('./models/Users');
require('./models/Purchases');
require('./models/Conversation');
require('./models/Messages');
require('./models/Images');
require('./config/passport');



// mongoose.connect('mongodb://localhost/market');
// mongoose.connect('mongodb://'+process.env.MLAB_USER+':'+process.env.MLAB_PW+'@ds131320.mlab.com:31320/farmers-market');

var passport = require('passport');

var routes = require('./controllers/index');

var app = express();

// set db
if(app.get('env')==='development'){
  mongoose.connect('mongodb://localhost/market');
}else{
  mongoose.connect('mongodb://'+process.env.MLAB_USER+':'+process.env.MLAB_PW+'@ds125113.mlab.com:25113/farm-to-meal-test');
}

// use helmet for security headers
// https://helmetjs.github.io/docs/
app.use(helmet());
app.use(fileUpload());
// app.use(bodyParser({uploadDir:'/public/images/content'}));

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
    console.log(err);
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


// var helper = require('sendgrid').mail;
// var fromEmail = new helper.Email('test@example.com');
// var toEmail = new helper.Email('whileyryan@gmail.com');
// var subject = 'Sending with SendGrid is Fun';
// var content = new helper.Content('text/plain', 'and easy to do anywhere, even with Node.js');
// var mail = new helper.Mail(fromEmail, subject, toEmail, content);

// var sg = require('sendgrid')(process.env.SENDGRID_API_KEY);
// var request = sg.emptyRequest({
//   method: 'POST',
//   path: '/v3/mail/send',
//   body: mail.toJSON()
// });

// sg.API(request, function (error, response) {
//   if (error) {
//     console.log('Error response received');
//   }
//   console.log(response.statusCode);
//   console.log(response.body);
//   console.log(response.headers);
// });


module.exports = app;
