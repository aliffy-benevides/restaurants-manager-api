import path from 'path';

const {
  RESTAURANT_MANAGER_DB_HOST,
  RESTAURANT_MANAGER_DB_USER,
  RESTAURANT_MANAGER_DB_PASSWORD,
  RESTAURANT_MANAGER_DB_DATABASE,
} = process.env

interface KnexConfig {
  [key: string]: object
}

const defaultConfigs = {
  useNullAsDefault: true,
  migrations: {
    directory: path.resolve(__dirname, 'migrations'),
    extension: 'ts'
  }
}

const knexConfig: KnexConfig = {
  test: {
    ...defaultConfigs,
    client: "sqlite3",
    connection: {
      filename: path.resolve(__dirname, 'test.sqlite')
    }
  },
  development: {
    ...defaultConfigs,
    client: "sqlite3",
    connection: {
      filename: path.resolve(__dirname, 'dev.sqlite')
    }
  },
  production: {
    ...defaultConfigs,
    client: 'mysql2',
    connection: {
      host: RESTAURANT_MANAGER_DB_HOST,
      user: RESTAURANT_MANAGER_DB_USER,
      password: RESTAURANT_MANAGER_DB_PASSWORD,
      database: RESTAURANT_MANAGER_DB_DATABASE
    }
  }
};

export default knexConfig;
