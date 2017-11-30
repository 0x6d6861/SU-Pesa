var express = require('express');
var router = express.Router();

var Subscriber = require('../database/models/Subscriber');
var Account = require('../database/models/Account');
var Transaction = require('../database/models/Transaction');


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

router.post('/transact', function(req, res, next) {
    
    var pin = req.param.pin;
    var phoneNumber = req.param.phoneNumber;
    var amount = req.param.amount;
    var type = req.param.type;
    
    new Subscriber({
        pin: pin,
        phoneNumber: phoneNumber
    }).fetch()
    .then(function(subscriber) {
            
            if(!subscriber){
                res.send({success: false, message: "Wrong PIN or no account by that number"}.toJSON());
            }
            
            new Account({
                subscriber_id: subscriber.id
            }).fetch().then(function(account){
                if (account) {
                    // pass params to save instead of set()
                    
                    switch(type) {
                        case "deposit":
                            var params = { 'amount' : account.amount + amount };
                            break;
                        case "withdrawal":
                            // TODO: Compute charge
                            var params = { 'amount' : account.amount - amount };
                            break;
                        case "transfer":
                            var params = { 'amount' : account.amount - amount };
                            break;
                        default:
                            res.send({success: false, message: "need to provide type of transaction"});
                    }
                    
                    account.save(params, {
                        method: 'update',
                        patch: true
                    }).then(function(account){
                        
                        var transaction_code = "RAANDOM";
                        
                        if(type == "transfer"){
                            var to = req.param.to;
                            new Subscriber({
                                pin: pin,
                                phoneNumber: to
                            }).fetch().then(function(to){
                                 new Account({
                                        subscriber_id: to.id
                                    }).fetch().then(function(account){
                                        var params = { 'amount' : account.amount + amount };
                                        account.save(params, {
                                            method: 'update',
                                            patch: true
                                        }).then(function(account){
                                            // send sms to both useers
                                            res.send({success: true, message: "Money Recived", code: transaction_code}.toJSON());
                                        });
                                    });
                            });
                            
                            /*new Transaction({
                                type: type,
                                amount: amount,
                                code: transaction_code
                            }).save().then(function(){
                                res.send({success: true, message: "Money Deposited", code: transaction_code}.toJSON())
                            });*/
                        }else{
                            new Transaction({
                                type: type,
                                amount: amount,
                                code: transaction_code
                            }).save().then(function(){
                                res.send({success: true, message: "Money Deposited", code: transaction_code}.toJSON())
                            });
                        }
                        
                    })
                    
                }
            });
    }).catch(function(error) {
      console.log(error);
      res.send('An error occured');
    });
});



router.post('/transfer', function(req, res, next) {
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

router.get('/transactions', function(req, res, next) {
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
