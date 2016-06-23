var express = require('express');
var router = express.Router();

// vendor library
var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');

var userFunctions = require('../functions/userFunctions.js')

router.get('/', function (req, res, next) {
    var user = null;
    if(req.isAuthenticated())
       user = req.user;
    res.render('index', {title: 'Home', user: user});
});

module.exports = router;
