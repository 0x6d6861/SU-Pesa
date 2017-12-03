var express = require('express');
var router = express.Router();

var UssdMenu = require('ussd-menu-builder');
var menu = new UssdMenu();

// Define menu states 
menu.startState({
	run: () => {
		// use menu.con() to send response without terminating session       
		menu.con('Welcome to SUPesa. Choose option:' +
			'\n1. Send Money' +
			'\n2. Withdraw Cash' +
			'\n3. Deposit Cash' +
			'\n4. Show Balance');
	},
	// next object links to next state based on user input 
	next: {
		'1': 'sendMoney',
		'2': 'withdrawCash',
		'3': 'depositCash',
		'4': 'showBalance'
	},
	defaultNext: 'invalidOption'
});

menu.state('sendMoney', {
	run: () => {
		// fetch balance 
		/* fetchBalance(menu.args.phoneNumber).then(function (bal) {
			// use menu.end() to send response and terminate session 
			menu.end('Your balance is KES ' + bal);
		}); */
		menu.con("Enter recipient phone number: ")
	},
	next: {
		'*\\d+': 'sendMoney.recipient'
	}
});
menu.state('sendMoney.recipient', {
	run: () => {
		// use menu.val to access user input value 
		var recipient = Number(menu.val);
		let session = getSession(menu.args.sessionId);
		session.set('recipient', recipient);
		/* buyAirtime(menu.args.phoneNumber, amount).then(function (res) {
			menu.end('Airtime bought successfully.');
		}); */
		menu.con("Please Provide your PIN number: ");
	},
	next: {
		'*\\d+': 'sendMoney.send'
	}
});

menu.state('sendMoney.send', {
	run: () => {
		// use menu.val to access user input value 
		var pin = Number(menu.val);
		var session = getSession(menu.args.sessionId);
		var recipient = session.get('recipient');
		/* buyAirtime(menu.args.phoneNumber, amount).then(function (res) {
			menu.end('Airtime bought successfully.');
		}); */
		// menu.con("Please Provide your PIN number: ");
		menu.end("your phone number is: " + recipient);
	},
	/* next: {
		'*\\d+': 'sendMoney.send'
	} */
});

menu.state('buyAirtime', {
	run: () => {
		menu.con('Enter amount:');
	},
	next: {
		// using regex to match user input to next state 
		'*\\d+': 'buyAirtime.amount'
	}
});

// nesting states 
menu.state('buyAirtime.amount', {
	run: () => {
		// use menu.val to access user input value 
		var amount = Number(menu.val);
		/* buyAirtime(menu.args.phoneNumber, amount).then(function (res) {
			menu.end('Airtime bought successfully.');
		}); */
		menu.end("Airtime Bought " + amount);
	}
});


router.post('/', (req, res, next) => {
	menu.run(req.body, ussdResult => {
		res.send(ussdResult);
	})
});

module.exports = router;
