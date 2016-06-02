var express = require('express');
var router = express.Router();

var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');

var userFunctions = require('../functions/userFunctions.js')

// Display all Users
router.get('/', function (req, res) {
  if (req.isAuthenticated()) {
    userFunctions.GetAllUsers(function (users) {
      res.send(users);
    });
  }
  else {
    res.send('No rights!');
  }

});

router.get('/login', function (req, res, next) {
    if(req.isAuthenticated()) res.redirect('/');
    res.render('signin', {title: 'Sign In'});
});

router.post('/login', function (req, res, next) {
  passport.authenticate('local', { successRedirect: '/',
                         failureRedirect: '/Users/login'}, function(err, user, info) {
     if(err) {
        return res.render('signin', {title: 'Sign In', errorMessage: err.message});
     }

     if(!user) {
        return res.render('signin', {title: 'Sign In', errorMessage: info.message});
     }
     return req.logIn(user, function(err) {
        if(err) {
           return res.render('signin', {title: 'Sign In', errorMessage: err.message});
        } else {

          if (!req.body.remember) {
            req.session.cookie.expires = false;
          } else {
            req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
          }
          res.redirect('/');
      }
      });

  })(req, res, next);
});



router.get('/register', function (req, res, next) {
  if(req.isAuthenticated()) {
     res.redirect('/');
  } else {
     res.render('signup', {title: 'Sign Up'});
  }
});

router.post('/register', function (req, res, next) {
  var user = req.body;

  // Check for email

  userFunctions.GetUser(user.username, function (result) {
    if(result) {
       res.render('signup', {title: 'signup', errorMessage: 'username already exists'});
    } else {
       //****************************************************//
       // MORE VALIDATION GOES HERE(E.G. PASSWORD VALIDATION)
       //****************************************************//
       var password = user.password;
       var hash = bcrypt.hashSync(password);

       userFunctions.AddUser(user.username, hash, function (result) {
         res.redirect('/');
       });

    }
  });
});

router.get('/logout', function (req, res, next) {
  if(!req.isAuthenticated()) {
     notFound404(req, res, next);
  } else {
     req.logout();
     req.session.destroy();
     res.redirect('/users/login');
  }
});

module.exports = router;
