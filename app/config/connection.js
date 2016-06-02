var express = require('express');
var mysql = require('mysql');


// not real database, just for authentication learning purpose
var pool = mysql.createPool({
    connectionLimit : 10,
	  host: 'localhost',
    user     : 'root',
    password : '',
    database : 'dbUsers',
    dateStrings: 'date'
});

module.exports = pool;
