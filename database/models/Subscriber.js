var bookshelf = require('../index');
var Account = require('./Account');

var Subscriber = bookshelf.Model.extend({
    tableName: 'subscribers',
    hasTimestamps: true,
    account: function() {
        return this.hasOne(Account, 'subscriber_id');
    },

}, {});

module.exports = Subscriber;