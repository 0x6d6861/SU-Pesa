var path = require('path');
var knex = require('knex')({
    client: 'sqlite3',
    connection: {
        filename: path.join(__dirname, '/database.db')
    }
});

//===CREATING TABLES===






var bookshelf = require('bookshelf')(knex);


module.exports = bookshelf;