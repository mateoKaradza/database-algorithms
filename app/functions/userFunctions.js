var express = require('express');
var pool = require('../config/connection.js');

module.exports.GetAllUsers = function (callback) {
  pool.query('SELECT * from USERS', function (err, result) {
    if (err)
      console.log(err);
    else
      callback(result);
  });
};

module.exports.GetUser = function (username, callback) {
  pool.query('SELECT * from USERS WHERE username = ?', username, function (err, result) {
    if (err)
      console.log(err);
    else
      callback(result[0]);
  });
};

module.exports.GetUserByEmail = function (email, callback) {
  pool.query('SELECT * from USERS WHERE email = ?', email, function (err, result) {
    if (err)
      console.log(err);
    else
      callback(result[0]);
  });
};

module.exports.AddUser = function (username, password, email, callback) {
  pool.query('INSERT INTO USERS SET ?', {username: username, password: password, email: email}, function (err, result) {
    if (err)
      console.log(err);
    else
      callback(result);
  });
};
