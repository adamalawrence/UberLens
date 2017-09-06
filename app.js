var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var PythonShell = require('python-shell');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

app.get('/lens/', function( req, res) {
  // get origin, destination, walkpref
  const origin = req.query.origin;
  const dest = req.query.dest;
  const walkpref = req.query.walkpref;
  
  // call python script to get hex grid
  var options = {
    mode: 'text',
    // pythonPath: 'path/to/python',
    // pythonOptions: ['-u'],
    // scriptPath: '',
    args: ['15805 SE 37th St, Bellevue, WA 98006', '15010 Northeast 36th Street, Redmond, WA 98052']
  };
  console.log('### Calling python script...');
  PythonShell.run('main.py', options, function (err, results) {
    if (err) throw err;
    // results is an array consisting of messages collected during execution
    // console.log(results);
    fares = {};
    for (var i = 0; i < results.length; i++) {
      // console.log(results[i].split("#"));
      var addr = results[i].split("#")[0].trim();
      var fare = parseFloat(results[i].split("#")[1].trim());
      fares[addr] = fare;
      // console.log(addr, fare);
    };
    var minFare = 999;
    var minAddr = '';
    for (var key in fares) {
      console.log('hi');
      if (fares[key] < minFare) {
        minFare = fares[key];
        minAddr = key;
      }
    }
    console.log(fares);
    console.log(minFare);
    // console.log(minFare, fares[minFare]);
    res.send(`Go here!: ${minAddr}`);
  });
  // asynchronously call uber lens api
  // const q = req.query;
  // res.send(q);  
}); 




// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;