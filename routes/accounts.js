var express = require('express');
var router = express.Router();

var Subscriber = require('../database/models/Subscriber');
var Account = require('../database/models/Account');
var Transaction = require('../database/models/Transaction');

var sms = require('../inc/AfricasTalking');


router.post('/transact', function(req, res, next) {
    
    var pin = req.body.pin;
    var phoneNumber = req.body.phoneNumber;
    var amount = req.body.amount;
    var type = req.body.type;
    
    new Subscriber({
        pin: pin,
        phoneNumber: phoneNumber
    }).fetch()
    .then(function(subscriber) {
            
            if(!subscriber){
                res.send({success: false, message: "Wrong PIN or no account by that number"});
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
                            var to = req.body.to;
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
                                        }).then(function (account) {
                                            var from = {
                                                from: "SUPesa",
                                                to: phoneNumber,
                                                message: `You have sent KSH${amount} to ${to}.\n
                                                    Transaction code: ${transaction_code}\n
                                                    Balance: ${account.amount}`
                                            };

                                            var to = {
                                                from: "SUPesa",
                                                to: to,
                                                message: `You have received KSH${amount} from ${phoneNumber}.\n
                                                    Transaction code: ${transaction_code}\n
                                                    Balance: ${account.amount}`
                                            };

                                            sms.send(to)
                                                .then((success) => {
                                                    console.log(success);
                                                })
                                                .catch((error) => {
                                                    console.log(error.message);
                                                });

                                            sms.send(from)
                                                .then((success) => {
                                                    console.log(success);
                                                })
                                                .catch((error) => {
                                                    console.log(error.message);
                                                });
                                            // send sms to both useers
                                            res.send({success: true, message: "Money Transfered", code: transaction_code});
                                        });
                                    });
                            });
                        }else{
                            new Transaction({
                                type: type,
                                amount: amount,
                                code: transaction_code
                            }).save().then(function (transaction) {
                                var to = {
                                    from: "SUPesa",
                                    to: phoneNumber,
                                    message: null
                                };
                                if (type == "deposit") {
                                    to.message = `You have received KSH ${amount} from ${phoneNumber}.\n
                                                    Transaction code: ${transaction_code}\n
                                                    Balance: ${account.amount}`;
                                } else if (type == "withdrawal") {
                                    to.message = `You have withdrawn KSH ${amount} from ${phoneNumber}.\n
                                                    Transaction code: ${transaction_code}\n
                                                    Balance: ${account.amount}`;
                                }

                                sms.send(to)
                                    .then((success) => {
                                        console.log(success);
                                    })
                                    .catch((error) => {
                                        console.log(error.message);
                                    });
                                res.send({success: true, message: to.message, code: transaction_code})
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


router.get('/transactions', function (req, res, next) {

    var pin = req.body.pin;
    var phoneNumber = req.body.phoneNumber;

    new Subscriber({
        pin: pin,
        phoneNumber: phoneNumber
    }).fetch()
        .then(function (subscriber) {
            new Account({
                subscriber_id: subscriber.id
            }).fetch({
                withRelated: [
                    {
                        transactions: function (query) {
                            //query.column('id'); 
                        }

                    }
                ],
                columns: ['id', 'type', 'amount']
                }).then(function (account) {
                    res.send(account);
            });
    }).catch(function(error) {
      console.log(error);
      res.send('An error occured');
    });
});

module.exports = router;
