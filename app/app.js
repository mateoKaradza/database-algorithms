var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var app = express();
var mysql = require('mysql');
var router = express.Router();
var logger = require('morgan');

var cookieParser = require('cookie-parser');
var session = require('express-session');
var bcrypt = require('bcrypt-nodejs');
var MySQLStore = require('express-mysql-session')(session);

// Configure app
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('', router);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

// na dva mista podaci o konekciji
var options = {
	host: 'localhost',
	port: 3306,
	user: 'root',
	password: '',
	database: 'dbUsers'
};

var sessionStore = new MySQLStore(options);

app.use(session({
	key: 'bp2-cookie',
	secret: 'super secret bp2 cookie secret',
	store: sessionStore,
	resave: true,
	saveUninitialized: true
}));

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var userFunctions = require('./functions/userFunctions.js')

// Passport - AUTH
passport.use(new LocalStrategy(function(username, password, done) {
	userFunctions.GetUser(username, function (user) {
		if (user === null) { return done(null, false, {message: 'Invalid username or password'});
		} else {
			if(!bcrypt.compareSync(password, user.password)) {
				 return done(null, false, {message: 'Invalid username or password'});
			} else { return done(null, user); }
		}
	});
}));

passport.serializeUser(function(user, done) {
  done(null, user.username);
});

passport.deserializeUser(function(username, done) {
	userFunctions.GetUser(username, function (user) {
		done(null, user);
	});
});

app.set('port', process.env.PORT || 3000);
app.use(cookieParser());

app.use(passport.initialize());
app.use(passport.session());

// Routing
var Home = require('./routes/index');
var Users = require('./routes/users');

app.use('/', Home);
app.use('/Users', Users);

// 404
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
		next();
});

if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('404', {
            message: err.message,
            error: err
}); }); }

var server = app.listen(app.get('port'), function(err) {
   if(err) throw err;

   var message = 'Server is running @ http://localhost:' + server.address().port;
   console.log(message);
});
