
exports.up = function(knex, Promise) {
    return knex.schema.createTable('subscribers', function(table) {
        table.increments();
        table.string('name');
        table.integer('pin');
        table.string('phoneNumber');
        table.timestamps();
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.destroyTable('subscribers');
};
