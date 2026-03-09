import type { Knex } from 'knex';

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'chat_user',
      password: process.env.DB_PASSWORD || 'chat_password',
      database: process.env.DB_NAME || 'chat_db',
    },
    migrations: {
      directory: './migrations',
    },
  },
};

export default config;
