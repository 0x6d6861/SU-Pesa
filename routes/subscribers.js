var express = require('express');
var router = express.Router();

var Subscriber = require('../database/models/Subscriber');
var Account = require('../database/models/Account');
var Transaction = require('../database/models/Transaction');

var sms = require('../inc/AfricasTalking');

router.get("/test", function (req, res, next) {
    new Transaction({
        phoneNumber: "+254772369355"
    }).fetch().then(function(TO_subscriber){
        res.send(TO_subscriber);
    });
})


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
      res.send(subscribers);
    }).catch(function(error) {
      console.log(error);
      res.send('An error occured');
    });
});

router.get('/profile', function (req, res, next) {
    var phoneNumber = req.body.phoneNumber
    var pin = req.body.pin;
    new Subscriber({
        phoneNumber: phoneNumber,
        pin: pin
    }).fetch({
        withRelated: [
            {
                account: function (query) {
                    //query.column('id'); 
                }

            }
        ],
        columns: ['id', 'name', 'phoneNumber']
    })
        .then(function (subscriber) {
            res.send({success: true, subscriber: subscriber});
        }).catch(function (error) {
            console.log(error);
            res.send({ success: false, message: "An Error occured!" });
nd('An error occured');
        });
});

router.post('/new', function (req, res, next) {
    var phoneNumber = req.body.phoneNumber
    var pin = req.body.pin;
    var name = req.body.name;
    new Subscriber({
        phoneNumber: phoneNumber,
        pin: pin,
        name: name
    }).save()
        .then(function (subscriber) {

            new Account({
                type: "regular",
                amount: "0",
                subscriber_id: subscriber.id
            }).save();

            var to = {
                from: "SUPesa",
                to: phoneNumber,
                message: `Welcome ${subscriber.name} to the coolest
                Mobile money transfer`
            };

            sms.send(to)
                .then((success) => {
                    console.log(success);
                })
                .catch((error) => {
                    console.log(error.message);
                });
            res.send(subscriber);
        }).catch(function (error) {
            console.log(error);
            res.send({ success: false, message: "An Error occured!" });
nd('An error occured');
        });
});



module.exports = router;
