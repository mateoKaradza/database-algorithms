var express = require('express');
var mysql = require('mysql');

var pool = mysql.createPool({
    connectionLimit : 10,
	  host: 'localhost',
    user     : 'root',
    password : '',
    database : 'baze_seminar',
    dateStrings: 'date'
});

module.exports = pool;
