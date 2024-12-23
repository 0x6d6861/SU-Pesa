var express = require('express');
var router = express.Router();

var axiosPLAIN = require('axios');
var axios = axiosPLAIN.create({
	baseURL: 'https://supesa.herokuapp.com/'
});

var PNF = require('google-libphonenumber').PhoneNumberFormat;
var phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

var sessions = {};

var UssdMenu = require('ussd-menu-builder');
var menu = new UssdMenu();

menu.sessionConfig({
	start: (sessionId, callback) => {
		// initialize current session if it doesn't exist 
		// this is called by menu.run() 
		if (!(sessionId in sessions)) sessions[sessionId] = {};
		callback();
	},
	end: (sessionId, callback) => {
		// clear current session 
		// this is called by menu.end() 
		delete sessions[sessionId];
		callback();
	},
	set: (sessionId, key, value, callback) => {
		// store key-value pair in current session 
		sessions[sessionId][key] = value;
		callback();
	},
	get: (sessionId, key) => {
		return new Promise((resolve, reject) => {
			let value = sessions[sessionId][key];
			resolve(value);
		});
	}
});

menu.startState({
	run: () => {      
		menu.con('Welcome to SUPesa. Choose option:' +
			'\n1. Send Money' +
			'\n2. Withdraw Cash' +
			'\n3. Deposit Cash' +
			'\n4. Show Balance');
	},
	next: {
		'1': 'sendMoney',
		'2': 'withdrawCash',
		'3': 'depositCash',
		'4': 'showBalance'
	},
	defaultNext: 'invalidOption'
});


// === Send Money section
menu.state('sendMoney', {
	run: () => {
		menu.con("Enter recipient phone number: ")
	},
	next: {
		'*\\d+': 'sendMoney.recipient'
	}
});
menu.state('sendMoney.recipient', {
	run: () => {
		/* var phoneNumber = phoneUtil.parse(Number(menu.val), 'KE');
		var recipient = phoneUtil.format(phoneNumber, PNF.E164); */
		var recipient = "+254" + Number(menu.val);
		console.log(recipient);
		menu.session.set('recipient', recipient, (err) => {
			menu.con("Please enter the amount to send: ");
		});
		
	},
	next: {
		'*\\d+': 'sendMoney.amount'
	}
});

menu.state('sendMoney.amount', {
	run: () => {
		var amount = Number(menu.val);
		menu.session.set('amount', amount, (err) => {
			menu.con("Please provide your PIN: ");
		});

	},
	next: {
		'*\\d+': 'sendMoney.send'
	}
});

menu.state('sendMoney.send', {
	run: () => {
		var pin = Number(menu.val);
		menu.session.get('recipient').then(recipient => {
			console.log(recipient);
			menu.session.get('amount').then(amount => {
				console.log(amount);
				axios.post('/accounts/transact', {
					pin: pin,
					phoneNumber: menu.args.phoneNumber,
					type: "transfer",
					amount: amount,
					to: recipient
				}).then(function (response) {
					if(response.data.success){
						menu.end("KSH" + amount + " sent to " + response.data.to.name + "\nCode: " + response.data.code);
					}else {
						menu.end(response.data.message);
					}
					

						// console.log(response);
				}).catch(function (error) {
					menu.end(error.message);
				});
			})
			
        });
		
	},
});
// === END Send money section

// === Withdraw Cash section
menu.state('withdrawCash', {
	run: () => {
		menu.con('Enter amount to withdraw:');
	},
	next: {
		// using regex to match user input to next state 
		'*\\d+': 'withdrawCash.amount'
	}
});
menu.state('withdrawCash.amount', {
	run: () => {
		// use menu.val to access user input value 
		var amount = Number(menu.val);
		menu.session.set('amount', amount, (err) => {
			menu.con("Please Provide your PIN number: ");
		});
		/* buyAirtime(menu.args.phoneNumber, amount).then(function (res) {
			menu.end('Airtime bought successfully.');
		}); */

	},
	next: {
		'*\\d+': 'withdrawCash.send'
	}
});
menu.state('withdrawCash.send', {
	run: () => {
		// use menu.val to access user input value 
		var pin = Number(menu.val);
		menu.session.get('amount').then(amount => {
			//TODO: add the callback for the widthdraw function
			menu.session.get('amount').then(amount => {
				axios.post('/accounts/transact', {
					pin: pin,
					phoneNumber: menu.args.phoneNumber,
					type: "withdrawal",
					amount: amount
				}).then(function (response) {
					if(response.data.success){

						menu.end("You have removed: KSH" + amount + "from your account\nCode: " + response.data.code);
					}else{
						menu.end(response.data.message);
					}
					// console.log(response);
				}).catch(function (error) {
					menu.end(error.message);
				});
			})
		});
	}
});
// === END Withdraw cash section

// === Deposit cash section
menu.state('depositCash', {
	run: () => {
		menu.con('Enter amount to Deposit:');
	},
	next: {
		// using regex to match user input to next state 
		'*\\d+': 'depositCash.amount'
	}
});
menu.state('depositCash.amount', {
	run: () => {
		// use menu.val to access user input value 
		var amount = Number(menu.val);
		menu.session.set('amount', amount, (err) => {
			menu.con("Please Provide your PIN number: ");
		});
		/* buyAirtime(menu.args.phoneNumber, amount).then(function (res) {
			menu.end('Airtime bought successfully.');
		}); */

	},
	next: {
		'*\\d+': 'depositCash.send'
	}
});
menu.state('depositCash.send', {
	run: () => {
		var pin = Number(menu.val);
		menu.session.get('amount').then(amount => {
			axios.post('/accounts/transact', {
				pin: pin,
				phoneNumber: menu.args.phoneNumber,
				type: "deposit",
				amount: amount
			}).then(function (response) {
				if(response.data.success){

					menu.end("You have deposited: KSH" + amount + "\nCode: " + response.data.code);
				}else{
					menu.end(response.data.message);
				}
				//console.log(response);
			}).catch(function (error) {
				menu.end(error.message);
			});
		});
	}
});
// === END Deposit Cash section

// === Show Balance section 
menu.state('showBalance', {
	run: () => {
		menu.con("Please provide your PIN to continue")
	},
	next: {
		'*\\d+': 'showBalance.send'
	}
});

menu.state('showBalance.send', {
	run: () => {
		var pin = Number(menu.val);
		axios.get('/subscribers/profile', {
			pin: pin,
			phoneNumber: menu.args.phoneNumber
		}).then(function (response) {
			if(response.data.success){

				menu.end("Name: " + response.data.subscriber.name + "\nBalance: " + response.data.account.amount);
			}else{
				menu.end(response.data.subscriber.message);
			}
			// console.log(response.data);
		}).catch(function (error) {
			menu.end(error.message);
		});
	}
});
// === END Show Balance section


menu.state('invalidOption', {
	run: () => {
		menu.con("Sorry you option was not understood")
	},
});

router.post('/', (req, res, next) => {
	menu.run(req.body, ussdResult => {
		res.send(ussdResult);
	})
});

module.exports = router;
