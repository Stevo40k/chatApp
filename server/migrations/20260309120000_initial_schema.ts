import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema
    .createTable('users', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('username').notNullable().unique();
      table.timestamps(true, true);
    })
    .createTable('rooms', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('name').notNullable();
      table.uuid('owner_id').references('id').inTable('users').onDelete('CASCADE');
      table.timestamps(true, true);
    })
    .createTable('messages', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('room_id').references('id').inTable('rooms').onDelete('CASCADE').notNullable();
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE').notNullable();
      table.text('content').notNullable();
      table.timestamps(true, true);
    })
    .createTable('invites', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('room_id').references('id').inTable('rooms').onDelete('CASCADE').notNullable();
      table.string('token').notNullable().unique();
      table.timestamp('expires_at');
      table.timestamps(true, true);
    });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema
    .dropTableIfExists('invites')
    .dropTableIfExists('messages')
    .dropTableIfExists('rooms')
    .dropTableIfExists('users');
}
