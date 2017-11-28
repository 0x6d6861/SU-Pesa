
exports.up = function(knex, Promise) {
    return knex.schema.createTable('accounts', function(table) {
        table.increments();
        table.integer('subscriber_id').unsigned();
        table.foreign('subscriber_id')
            .references('id')
            .inTable('subscribers')
            .onDelete('CASCADE');
        table.string('type'); // type (regular, agent)
        table.integer('amount');
        table.timestamps();
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.destroyTable('accounts');
};
