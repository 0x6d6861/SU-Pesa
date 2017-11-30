var bookshelf = require('../index');
var Transaction = require('./Transaction');
var Account = bookshelf.Model.extend({
    tableName: 'accounts',
    hasTimestamps: true,
    subscriber: function() {
        return this.belongsTo('Subscriber', 'subscriber_id');
    },
    transactions: function() {
        return this.hasMany(Transaction, 'account_id');
    },

}, {});

module.exports = Account;