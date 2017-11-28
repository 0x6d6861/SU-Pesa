
exports.up = function(knex, Promise) {
    return knex.schema.createTable('users', function(table) {
        table.increments();
        table.string('name');
        table.string('email', 128);
        table.string('role');
        table.string('password');
        table.timestamps();
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.destroyTable('users');
};
