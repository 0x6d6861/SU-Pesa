var bookshelf = require('../index');
var Transaction = bookshelf.Model.extend({
    tableName: 'transactions',
    hasTimestamps: true,
    account: function() {
        return this.belongsTo('Account', 'account_id');
    },

}, {});

module.exports = bookshelf.model('Transaction', Transaction);