var express = require('express');
var router = express.Router();

var Subscriber = require('../database/models/Subscriber');
var Account = require('../database/models/Account');

/* GET users listing. */
router.get('/all', function(req, res, next) {
    new Subscriber().fetchAll({ 
         withRelated: [
            { 
                account: function(query) { 
                    //query.column('id'); 
                }
                
            }
          ],
        columns: ['id', 'name', 'phoneNumber'] 
    })
    .then(function(subscribers) {
      res.send(subscribers.toJSON());
    }).catch(function(error) {
      console.log(error);
      res.send('An error occured');
    });
});

router.post('/save', function(req, res, next) {
    new Subscriber({
        name: "Heri Agape",
        pin: "1234",
        phoneNumber: "+254700928129"
    }).save()
    .then(function(subscriber) {
            new Account({
                type: "regular",
                amount: "1589",
                subscriber_id: subscriber.id
            }).save().then(function(account){
                res.send("Success");
            })
    }).catch(function(error) {
      console.log(error);
      res.send('An error occured');
    });
});

router.get('/profile', function(req, res, next) {
    new Subscriber({
        pin: "1234",
        phoneNumber: "+254700928129"
    }).fetch({ 
         withRelated: [
            { 
                account: function(query) { 
                    //query.column('id'); 
                }
                
            }
          ],
        columns: ['id', 'name', 'phoneNumber'] 
    })
    .then(function(subscriber) {
            res.send(subscriber.toJSON());
    }).catch(function(error) {
      console.log(error);
      res.send('An error occured');
    });
});

module.exports = router;
