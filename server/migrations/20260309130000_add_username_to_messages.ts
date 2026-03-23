import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Use raw SQL to drop the foreign key because knex might not find it by name
  await knex.raw('ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_user_id_foreign');
  
  await knex.schema.alterTable('messages', (table) => {
    table.string('username').nullable();
    table.string('user_id').alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('messages', (table) => {
    table.dropColumn('username');
  });
}
