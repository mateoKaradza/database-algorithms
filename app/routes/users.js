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

router.get('/Login', function (req, res, next) {
    if(req.isAuthenticated()) res.redirect('/');
    res.render('signin', {title: 'Sign In'});
});

router.post('/Login', function (req, res, next) {
  passport.authenticate('local', { successRedirect: '/',
                         failureRedirect: '/'}, function(err, user, info) {
     if(err) {
        return res.render('index', {title: 'Sign In', errorMessage: err.message});
     }
     if(!user) {
        return res.render('index', {title: 'Sign In', errorMessage: info.message});
     }
     return req.logIn(user, function(err) {
        if(err) {
           return res.render('index', {title: 'Sign In', errorMessage: err.message});
        } else {
          req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
          res.redirect('/');
        }
      });

  })(req, res, next);
});

router.get('/Register', function (req, res, next) {
  console.log('test');
  if(req.isAuthenticated()) {
     res.redirect('/');
  } else {
     res.render('register', {title: 'Sign Up'});
  }
});

router.post('/Register', function (req, res, next) {
  var user = req.body;

  // Check for email
  userFunctions.GetUserByEmail(user.email, function (result) {
    if(result) { res.render('register', {title:'Reg Title', errorMessage: 'User with that email already exists'});
    } else {
    userFunctions.GetUser(user.username, function (result) {
      if(result) {
         res.render('register', {title: 'signup', errorMessage: 'username already exists'});
      } else {
         if (user.password1 == user.password2) {
           if (user.password1.length > 5) {

           var password = user.password1;
           var hash = bcrypt.hashSync(password);

           userFunctions.AddUser(user.username, hash, user.email, function (result) {
             res.redirect('/');
           });
         } else {
           res.render('register', {title: 'signup', errorMessage: 'Password should be long at least 6 characters'});
         }

       } else {
         res.render('register', {title: 'signup', errorMessage: 'Passwords do not match'});
       }
      }
    });
  }});
});

router.get('/Logout', function (req, res, next) {
  if(!req.isAuthenticated()) {
     notFound404(req, res, next);
  } else {
     req.logout();
     req.session.destroy();
     res.redirect('/');
  }
});

module.exports = router;
