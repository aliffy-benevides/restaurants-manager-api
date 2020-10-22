import * as Knex from "knex";

const TABLE_NAME: string = 'products';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(TABLE_NAME, table => {
    table.increments('id').primary();

    table.string('photo_url').notNullable();
    table.string('name').notNullable();
    table.decimal('price').notNullable();
    table.string('category').notNullable();

    table.integer('restaurant_id').notNullable()
      .references('id')
      .inTable('restaurants')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(TABLE_NAME);
}
