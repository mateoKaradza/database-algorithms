var express = require('express');
var router = express.Router();

var schemaFunctions = require('../functions/schemaFunctions.js')

// Display all Shemas by user
router.get('/', function (req, res) {
  if (req.isAuthenticated()) {
    schemaFunctions.GetAllSchemas(req.user.username, function (result) {
      res.render('allSchemas', {result: result, user: req.user});
    });
  }
  else {
    res.render('noAccess');
  }
});

router.get('/New', function (req, res) {
  if (req.isAuthenticated()) {
  schemaFunctions.CreateSchema(req.user.username,  function (err, schema_id) {
      console.log(err);
      res.redirect('/Schemas/' + schema_id);
  });
  } else {
    res.render('noAccess');
  }
});

router.get('/:id', function (req, res) {
  if (req.isAuthenticated()) {
    schemaFunctions.GetSchema(req.params.id, function (schema) {
      schemaFunctions.GetAttributes(req.params.id, function (err1, attributes) {
        schemaFunctions.GetDependencies(req.params.id, function (err2, dependencies) {
          schemaFunctions.GetPrimaryKeys(req.params.id, function (err3, pkeys) {
            res.render('viewSchema', {schema: schema, dependencies: dependencies, attributes: attributes, user: req.user, pkeys: pkeys});
          });
        });
      });
    });
  } else {
    res.render('noAccess');
  }
});

router.get('/Normalize/:id', function (req, res) {
  if (req.isAuthenticated()) {
    schemaFunctions.GetSchema(req.params.id, function (schema) {
      schemaFunctions.GetAttributes(req.params.id, function (err1, attributes) {
        schemaFunctions.GetDependencies(req.params.id, function (err2, dependencies) {
          schemaFunctions.GetPrimaryKeys(req.params.id, function (err3, pkeys) {
            res.render('normalize', {schema: schema, dependencies: dependencies, attributes: attributes, user: req.user, pkeys: pkeys});
          });
        });
      });
    });
  } else {
    res.render('noAccess');
  }
});

router.get('/Attribute/New/:id', function (req, res) {
  if (req.isAuthenticated()) {
    res.render('addAttribute', {schema_id:req.params.id, user:req.user});
  } else {
    res.render('noAccess');
  }
});

router.post('/Attribute/New', function (req, res) {
  if (req.isAuthenticated()) {
    schemaFunctions.CreateAttribute(req.body, function (err, result) {
      if (err) // duplicate entry
        return res.render('addAttribute', {schema_id:req.body.schema_id, user:req.user, errorMessage: 'Duplicate entry'});
      res.redirect('/Schemas/' + result);
    });
  } else {
    res.render('noAccess');
  }
});

router.get('/Dependency/New/:id', function (req, res) {
  if (req.isAuthenticated()) {
    schemaFunctions.CreateDependency(req.params.id, function (err, result) {
      if (err)
        return console.log(err);
      res.redirect('/Schemas/' + req.params.id);
    })
  } else {
    res.render('noAccess');
  }
});

router.get('/PrimaryKey/New/:id', function (req, res) {
  if (req.isAuthenticated()) {
    schemaFunctions.CreatePrimaryKey(req.params.id, function (err, result) {
      if (err)
        return console.log(err);
      res.redirect('/Schemas/' + req.params.id);
    })
  } else {
    res.render('noAccess');
  }
});

router.get('/PrimaryKey/Edit/:id', function (req, res) {
  if (req.isAuthenticated()) {
    schemaFunctions.GetSchemaByPrimaryKey(req.params.id, function (err, schema_id) {
      if (err)
        return res.send('Does not exist');
        schemaFunctions.GetAttributes(schema_id, function (err3, attributes) {
          schemaFunctions.GetPrimaryKeyDetails(req.params.id, function (err4, pkey_details) {
            res.render('editPkey', {schema_id: schema_id, attributes: attributes, pkey_id: req.params.id, pkey_details: pkey_details, user: req.user})
          });
      });
    })
  } else {
    res.render('noAccess');
  }
});

router.post('/PrimaryKey/Edit', function (req, res) {
  if (req.isAuthenticated()) {
    var schema_id = req.body.schema_id;
    schemaFunctions.EditPkey(req.body, function (err, result) {
      res.redirect('/Schemas/' + schema_id);
    });
  } else {
    res.render('noAccess');
  }
});

router.get('/Dependency/Edit/:id', function (req, res) {
  if (req.isAuthenticated()) {
    schemaFunctions.GetSchemaByDependency(req.params.id, function (err, schema_id) {
      if (err)
        return res.send('Does not exist');
      schemaFunctions.GetAttributes(schema_id, function (err2, attributes) {
        schemaFunctions.GetDependencyDetails(req.params.id, function (err3, results) {
          schemaFunctions.GetDependencyDetailsString(req.params.id, function (err4, string) {
            res.render('editDependency', {schema_id: schema_id, dep_id: req.params.id, attributes: attributes, user: req.user, att_dep: results, funDep: string});
          });
        });
      })
    });
  } else {
    res.render('noAccess');
  }
});

router.post('/Dependency/Edit', function (req, res) {
  if (req.isAuthenticated()) {
    var schema_id = req.body.schema_id;
    schemaFunctions.EditDependency(req.body, function (err, result) {
      res.redirect('/Schemas/' + schema_id);
    });
  } else {
    res.render('noAccess');
  }
});

module.exports = router;
