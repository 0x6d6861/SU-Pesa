
exports.up = function(knex, Promise) {
    return knex.schema.createTable('transactions', function(table) {
        table.increments();
        table.string('type'); // Type (withdrwa, deposit, transfer)
        table.integer('amount');
        table.string('code');
        table.integer('account_id').unsigned();
        table.foreign('account_id')
            .references('id')
            .inTable('accounts');
        table.timestamps();
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.destroyTable('transactions');
};
