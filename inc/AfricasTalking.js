'use strict';
const options = {
  apiKey: 'af7cafbc444ac94306ce7b8aab6eda2931d341e055ed36d49a5849f83c519b63',         // Use sandbox API key for sandbox development
  username: 'sandbox',      // Use "sandbox" for sandbox development
};
const AfricasTalking = require('africastalking')(options);

const sms = AfricasTalking.SMS;

// console.log(sms);

/* opts = {
  from: "Smart USSD",
  to: "+254700928129",
  message: "Hellow"
}

sms.send(opts)
  .then((success) => {
    console.log(success);  })
  .catch((error)=>{
    console.log(error.message);
  }); */

module.exports = sms;