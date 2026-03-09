import knex from 'knex';
import config from '../knexfile';

const environment = process.env.NODE_ENV || 'development';
const dbConfig = config[environment];

if (!dbConfig && environment !== 'test') {
  throw new Error(`Database configuration for environment "${environment}" not found.`);
}

const db = knex(dbConfig || { client: 'pg' });

export default db;
