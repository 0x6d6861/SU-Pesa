var bookshelf = require('../index');
var User = bookshelf.Model.extend({
    tableName: 'users',
    hasTimestamps: true,

    verifyPassword: function(password) {
        return this.get('password') === password;
    }
}, {
    byEmail: (email) => {
        return this.forge().query({where:{ email: email }}).fetch();
    },
    /*transactions: () => {
        return this.forge().query({where:{ email: email }}).fetch();
    }*/
});

module.exports = User;