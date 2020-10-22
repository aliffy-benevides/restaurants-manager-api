import path from 'path';

import Knex from "knex";
import knexConfig from "./knexConfig";

import IDatabase from "./IDatabase";

export default class Database implements IDatabase {
  public knex: Knex;

  constructor() {
    const env = process.env.NODE_ENV || 'development';
    let config = knexConfig[env];

    if (env === 'test') {
      const databaseName = process.env.TEST_NAME + '.sqlite';
      config = {
        ...config,
        connection: {
          filename: path.resolve(__dirname, 'testDbs', databaseName)
        }
      }
    }

    this.knex = Knex(config);
  }

  private async unlock(): Promise<void> {
    const exists = await this.knex.schema.hasTable("knex_migrations_lock");
    if (exists) {
      await this.knex("knex_migrations_lock")
        .update("is_locked", '0');
    }
  }

  async Setup(): Promise<void> {
    await this.unlock();
    await this.knex.migrate.latest();
  }
  
  async Teardown(): Promise<void> {
    await this.unlock();
    await this.knex.migrate.rollback({}, true);
  }
}