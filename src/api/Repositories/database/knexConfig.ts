import path from 'path';

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
    client: 'mysql',
    connection: {
      host: '127.0.0.1',
      user: 'your_database_user',
      password: 'your_database_password',
      database: 'myapp_test'
    }
  }
};

export default knexConfig;
