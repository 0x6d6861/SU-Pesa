var bookshelf = require('../index');
var Account = require('./Account');

var Transaction = bookshelf.Model.extend({
    tableName: 'transactions',
    hasTimestamps: true,
    account: function() {
        return this.belongsTo(Account, 'account_id');
    },

}, {});

module.exports = Transaction;