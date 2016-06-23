var express = require('express');
var pool = require('../config/connection.js');
var moment = require('moment');
var async = require('async');

// SCHEMA

module.exports.GetAllSchemas = function (username, callback) {
  pool.query('SELECT * FROM rel_schemas WHERE username = ?', username,  function (err, result) {
    if (err)
      console.log(err);
    else
      callback(result);
  });
};

module.exports.GetSchema = function (schema_id, callback) {
  pool.query('SELECT * FROM rel_schemas WHERE schema_id = ?', schema_id,  function (err, result) {
    if (err)
      console.log(err);
    else
      callback(result[0]);
  });
};

module.exports.CreateSchema = function (username, callback) {
  var theTime = moment().format("YYYY-MM-DD HH:mm:ss");

  pool.query('INSERT INTO rel_schemas SET ?', {date_created: theTime, username: username }, function (err, result) {
    if (err)
      return callback(err);
    callback(null, result.insertId);
  });
}

module.exports.GetSchemaByDependency = function (dep_id, callback) {
  pool.query('SELECT * FROM dependencies WHERE dep_id = ?', dep_id, function (err, result) {
    if (err)
      return console.log(err);
    callback(null, result[0].schema_id);
  });
}

// ATTRIBUTE

module.exports.CreateAttribute = function (body, callback) {
  pool.query('INSERT INTO attributes SET ?', {schema_id: body.schema_id, attribute: body.attribute}, function (err, result) {
    if (err)
      return callback(err);
    callback(null, body.schema_id);
    });
}

module.exports.GetAttributes = function (schema_id, callback) {
  pool.query('SELECT attribute FROM attributes WHERE schema_id = ?', schema_id, function (err, result) {
    if (err)
      return callback(err);
    callback(null, result);
  });
}

// PRIMARY KEY

module.exports.CreatePrimaryKey = function (schema_id, callback) {
  pool.query('INSERT INTO primary_keys SET ?', {schema_id: schema_id}, function (err, result) {
    if (err)
      return callback(err);
    callback(null, result);
  });
}

module.exports.GetPrimaryKeys = function (schema_id, callback) {
  pool.query('SELECT * FROM primary_keys WHERE schema_id = ?', schema_id, function (err, result) {
    if (err)
      return callback(err);

    if (result.length === 0)
      return callback(null, null);

    async.map(result, function (theResult, callback2) {
      GetPrimaryKeyDetails(theResult.pkey_id, function (err2, result2) {
        var arr = Object.keys(result2).map(function(k) { return result2[k].attribute });
        theResult.string = arr.join(', ');
        callback2(null, theResult);
      });
    }, function () {
      return callback(null, result);
    });
  });
}

var GetPrimaryKeyDetails = module.exports.GetPrimaryKeyDetails = function (pkey_id, callback) {
  pool.query('SELECT attribute from primary_keys_attributes WHERE pkey_id = ?', pkey_id, function (err, result) {
    if (err)
      return callback(err);
    callback(null, result);
  });
}

module.exports.EditPkey = function (body, callback) {
  var pkey_id = body.pkey_id;
  var schema_id = body.schema_id;

  delete body.pkey_id;
  delete body.schema_id;

  body = Object.keys(body);

  var values = body.map(function (key) {
    var objValue = {};
    if (key.indexOf('pkey_attribute_') == 0) {
      objValue.left = true;
      objValue.attribute = key.replace('pkey_attribute_', '');
    }

    return objValue;
  });

  pool.query('DELETE FROM primary_keys_attributes WHERE pkey_id = ?', pkey_id, function (err1, result1) {
    values.forEach(function(dep) {
          pool.query('INSERT INTO primary_keys_attributes SET ?', {schema_id: schema_id, pkey_id: pkey_id, attribute: dep.attribute}, function (err2, result2) {
            if (err2)
              console.log(err2);
              // OK
          });
    });
  });
  callback(null, null);
}

// DEPENDENCIES

module.exports.CreateDependency = function (schema_id, callback) {
  pool.query('INSERT INTO dependencies SET ?', {schema_id: schema_id}, function (err, result) {
    if (err)
      return callback(err);
    callback(null, result);
  });
}

module.exports.GetDependencies = function (schema_id, callback) {
  pool.query('SELECT * FROM dependencies WHERE schema_id = ?', schema_id, function (err, result) {
    if (err)
      return callback(err);
    async.map(result, function (theResult, callback2) {
      GetDependencyDetailsString(theResult.dep_id, function (err, funDep) {
        if (!funDep)
          return callback2(null, theResult);
        theResult.string = funDep.string;
        theResult.left = funDep.left;
        theResult.right = funDep.right;
        callback2(null, theResult);
      });
    }, function (err2, result2) {
      callback(null, result2);
    });
  });
}

module.exports.GetSchemaByPrimaryKey = function (pkey_id, callback) {
  pool.query('SELECT * from primary_keys WHERE pkey_id = ?', pkey_id, function (err, result) {
    if (err)
      return callback(err);
    callback(null, result[0].schema_id);
  });
}

var GetDependencyDetails = module.exports.GetDependencyDetails = function GetDependencyDetails(dep_id, callback) {
  pool.query('SELECT attribute, left_side FROM dependencies_attributes WHERE dep_id = ?', dep_id, function (err, results) {
    if (err)
      return callback(err);
    callback(null, results);
  });
}

var GetDependencyDetailsString = module.exports.GetDependencyDetailsString = function (dep_id, callback) {
  GetDependencyDetails(dep_id, function (err, result) {
    if (!result || result.length === 0)
      return callback(null, null);
    var leftArray = [];
    var rightArray = [];
    var leftSide = "";
    var rightSide = "";
    result.forEach(function (dep) {
      if (dep.left_side == 1) {
        leftSide+= dep.attribute + ", ";
        leftArray.push(dep.attribute);
      }
      else {
        rightSide+= dep.attribute + ", ";
        rightArray.push(dep.attribute);
      }
    });
    leftSide = leftSide.substring(0, leftSide.length-2);
    rightSide = rightSide.substring(0, rightSide.length-2);
    var string = leftSide + " -> " + rightSide;
    callback(null, {string: string, left: leftArray, right: rightArray});
  });
}

module.exports.EditDependency = function (body, callback) {
  var dep_id = body.dep_id;
  var schema_id = body.schema_id;

  delete body.dep_id;
  delete body.schema_id;

  body = Object.keys(body);

  var values = body.map(function (key) {
    var objValue = {};
    if (key.indexOf('left_side') == 0) {
      objValue.left = true;
      objValue.attribute = key.replace('left_side_attribute_', '');
    } else {
      objValue.left = false;
      objValue.attribute = key.replace('right_side_attribute_', '');
    }

    return objValue;
  });

  pool.query('DELETE FROM dependencies_attributes WHERE dep_id = ?', dep_id, function (err1, result1) {
    values.forEach(function(dep) {
          pool.query('INSERT INTO dependencies_attributes SET ?', {schema_id: schema_id, dep_id: dep_id, attribute: dep.attribute, left_side: dep.left}, function (err2, result2) {
            if (err2)
              console.log(err2);
              // OK
          });
    });
  });

  return callback(null, null);
}
