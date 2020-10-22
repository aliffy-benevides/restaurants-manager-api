import * as Knex from "knex";

const TABLE_NAME: string = 'promotion_days';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(TABLE_NAME, table => {
    table.increments('id').primary();

    table.integer('day').notNullable().comment('Work day - 0 ~ 6 (Sunday to Saturday)');
    table.string('start', 5).notNullable().comment('Start time, follow the format \'HH:mm\'');
    table.string('end', 5).notNullable().comment('End time, follow the format \'HH:mm\'');

    table.integer('promotion_id').notNullable()
      .references('id')
      .inTable('promotions')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(TABLE_NAME);
}
