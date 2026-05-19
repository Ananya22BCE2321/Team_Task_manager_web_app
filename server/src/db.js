const path = require('path');
const knexLib = require('knex');

const isPostgres = Boolean(process.env.DATABASE_URL);
const sqliteFile = process.env.DB_FILE || path.join(__dirname, '..', 'database.sqlite');

const knex = knexLib({
  client: isPostgres ? 'pg' : 'sqlite3',
  connection: isPostgres ? process.env.DATABASE_URL : { filename: sqliteFile },
  useNullAsDefault: true,
  pool: {
    min: 0,
    max: 10
  }
});

async function init() {
  if (!isPostgres) {
    await knex.raw('PRAGMA foreign_keys = ON');
  }

  const existsUsers = await knex.schema.hasTable('users');
  if (!existsUsers) {
    await knex.schema.createTable('users', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('email').notNullable().unique();
      table.string('password').notNullable();
      table.string('role').notNullable().defaultTo('member');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    });
  }

  const existsProjects = await knex.schema.hasTable('projects');
  if (!existsProjects) {
    await knex.schema.createTable('projects', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.text('description');
      table.integer('owner_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    });
  }

  const existsMembers = await knex.schema.hasTable('project_members');
  if (!existsMembers) {
    await knex.schema.createTable('project_members', (table) => {
      table.increments('id').primary();
      table.integer('project_id').unsigned().notNullable().references('id').inTable('projects').onDelete('CASCADE');
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.unique(['project_id', 'user_id']);
    });
  }

  const existsTasks = await knex.schema.hasTable('tasks');
  if (!existsTasks) {
    await knex.schema.createTable('tasks', (table) => {
      table.increments('id').primary();
      table.string('title').notNullable();
      table.text('description');
      table.integer('project_id').unsigned().notNullable().references('id').inTable('projects').onDelete('CASCADE');
      table.integer('assignee_id').unsigned().references('id').inTable('users');
      table.string('status').notNullable().defaultTo('todo');
      table.date('due_date');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
  }

  return knex;
}

module.exports = { knex, init, isPostgres };
