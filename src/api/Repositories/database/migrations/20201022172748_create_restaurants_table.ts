import * as Knex from "knex";

const TABLE_NAME: string = 'restaurants';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(TABLE_NAME, table => {
    table.increments('id').primary();

    table.string('photo_url').notNullable();
    table.string('name').notNullable();
    table.string('address').nullable();
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(TABLE_NAME);
}
