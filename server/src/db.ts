import knex from 'knex';
import config from '../knexfile.js';

const environment = process.env.NODE_ENV || 'development';
const dbConfig = config[environment];

if (!dbConfig && environment !== 'test') {
  throw new Error(`Database configuration for environment "${environment}" not found.`);
}

const db = knex(dbConfig || { 
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'chat_user',
    password: process.env.DB_PASSWORD || 'chat_password',
    database: process.env.DB_NAME || 'chat_db',
  }
});

export default db;
