var express = require('express');
var pool = require('../config/connection.js');

module.exports.GetAllUsers = function (callback) {
  pool.query('SELECT * from tblUsers', function (err, result) {
    if (err)
      console.log(err);
    else
      callback(result);
  });
};

module.exports.GetUser = function (username, callback) {
  pool.query('SELECT * from tblUsers WHERE username = ?', username, function (err, result) {
    if (err)
      console.log(err);
    else
      callback(result[0]);
  });
};



module.exports.AddUser = function (username, password, callback) {
  // test
  pool.query('INSERT INTO tblUsers SET ?', {username: username, password: password}, function (err, result) {
    if (err)
      console.log(err);
    else
      callback(result);
  });
};
