var express = require('express');
var router = express.Router();
var randomstring = require("randomstring");

var Subscriber = require('../database/models/Subscriber');
var Account = require('../database/models/Account');
var Transaction = require('../database/models/Transaction');

var sms = require('../inc/AfricasTalking');


router.post('/transact', function(req, res, next) {
    
    var pin = req.body.pin;
    var phoneNumber = req.body.phoneNumber;
    var amount = req.body.amount;
    var type = req.body.type;
    //console.log(type);
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
                            var params = { 'amount' : Number(account.get('amount')) + amount };
                            break;
                        case "withdrawal":
                            // TODO: Compute charge
                            var params = { 'amount' : Number(account.get('amount')) - amount };
                            break;
                        case "transfer":
                            var params = { 'amount' : Number(account.get('amount')) - amount };
                            break;
                        default:
                            res.send({success: false, message: "need to provide type of transaction"});
                    }
                    //console.log(params);
                    // console.log(account.get('amount'));
                    account.save(params, {
                        method: 'update',
                        patch: true
                    }).then(function(account){
                        
                        var transaction_code = randomstring.generate({
                            charset: 'alphabetic',
                            readable: true,
                            length: 7,
                            capitalization: 'uppercase'
                        });
                        
                        if(type == "transfer"){
                            var to_sub = req.body.to;
                            console.log(to_sub);
                            new Subscriber({
                                phoneNumber: to_sub
                            }).fetch().then(function(TO_subscriber){
                                    
                                if(!TO_subscriber){
                                    account.save({ amount: params.amount - amount }, {
                                        method: 'update',
                                        patch: true
                                    }).then(function (account) {
                                        res.send({ success: false, message: "The subscriber does not exist!" });
                                    });
                                    
                                }
                                
                                 new Account({
                                        subscriber_id: TO_subscriber.get('id')
                                    }).fetch().then(function(to_account){
                                        //console.log(to_account);
                                        var params = { 'amount' : Number(to_account.get('amount')) + amount };
                                        to_account.save(params, {
                                            method: 'update',
                                            patch: true
                                        }).then(function (to_account) {
                                            //console.log(to_account);
                                            var from = {
                                                from: "SUPesa",
                                                to: phoneNumber,
                                                message: `You have sent KSH${amount} to ${TO_subscriber.get('name')}. Transaction code: ${transaction_code}. Balance: ${account.get('amount')}`
                                            };

                                            var to = {
                                                from: "SUPesa",
                                                to: TO_subscriber.get('phoneNumber'),
                                                message: `You have received KSH${amount} from ${subscriber.get('name')}.
                                                    Transaction code: ${transaction_code}
                                                    Balance: ${to_account.get('amount')}`
                                            };

                                            sms.send(to)
                                                .then((success) => {
                                                    //console.log(success);
            
                                                })
                                                .catch((error) => {
                                                    console.log(error.message);
                                                });

                                            sms.send(from)
                                                .then((success) => {
                                                    //console.log(success);
                                                })
                                                .catch((error) => {
                                                    console.log(error.message);
                                                });
                                            // send sms to both useers

                                            new Transaction({
                                                type: type,
                                                amount: amount,
                                                code: transaction_code,
                                                account_id: account.get("id")
                                            }).save().then(function (transaction) { 
                                                res.send({
                                                    success: true, message: "Money Transfered", to: {
                                                        phoneNumber: TO_subscriber.get('phoneNumber'),
                                                        name: TO_subscriber.get('name')
                                                    },
                                                    code: transaction_code
                                                });
                                            });

                                        });
                                    });
                            });
                        }else{
                            new Transaction({
                                type: type,
                                amount: amount,
                                account_id: account.get("id"),
                                code: transaction_code
                            }).save().then(function (transaction) {
                                var to = {
                                    from: "SUPesa",
                                    to: phoneNumber,
                                    message: null
                                };
                                if (type == "deposit") {
                                    to.message = `You have deposited KSH ${amount} to ${phoneNumber}. Transaction code: ${transaction_code}. Balance: ${account.get('amount')}`;
                                } else if (type == "withdrawal") {
                                    to.message = `You have withdrawn KSH ${amount} from ${phoneNumber}. Transaction code: ${transaction_code}. Balance: ${account.get('amount')}`;
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
      res.send({success: false, message: "An Error occured!"});
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
                }).then(function (account) {
                    res.send(account);
            });
    }).catch(function(error) {
      console.log(error);
        res.send({ success: false, message: "An Error occured!" });
    });
});

module.exports = router;
