var express = require('express');
var router = express.Router();

var User = require('../database/models/User');

/* GET home page. */
router.get('/', function(req, res, next) {
    new User({email: 'user@mail.com'})
      .fetch()
      .then(function(model) {
        console.log(model);
        res.send(model);
      });
  //res.render('index', { title: 'Express' });
});

router.get('/save', (req, res, next) => {
    new User({email: 'user@mail.com', name: "Cool Person", role: "admin" , password: "hello"})
      .save()
      .then(function(model) {
        console.log(model.get('name'));
      });
})

module.exports = router;
