var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var routes = require('./routes/index');
var books = require('./routes/books');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (req, res) => {
  res.send('ok')
})

app.get('/version', (req, res) => {
  res.send('1') // change this string to ensure a new version deployed
})

app.use('/', routes);
app.use('/books', books);
const {sequelize} = require('./models');

// Connection testing script:
// (async function() {
//   try {
//     await sequelize.authenticate();
//     console.log('Connection has been established successfully.');
//   } catch (error) {
//     console.error('Unable to connect to the database:', error);
//   }
// })();

// catch 404
app.use(function(req, res, next) {  
  const error = new Error();
  error.status = 404;
  error.message = 'Page Not Found!';
  next(error);
});

// error handler
app.use(function(err, req, res, next) {  
  if (err.status === 404) {
    res.status(err.status);
    res.render('page-not-found', {err, title:"Not Found!"})
  } else {
    res.status(err.status || 500);
    err.message = err.message || "Something went wrong!";
    res.render('error', {message: err.message, error: err, title: "Error!"})
  }
});

module.exports = app;
