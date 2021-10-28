import { knex } from './db';

export type DbGuild = {
    id: string;
    prefix: string | null;
    auto_sync: boolean | null;
    sync_channel_id: string | null;
    log_channel_id: string | null;
};

export type DbRolePermissionOverride = {
    guildId: string;
    roleId: string;
    commandName: string;
    allow: boolean;
};

export type DbUserPermissionOverride = {
    guildId: string;
    userId: string;
    commandName: string;
    allow: boolean;
};

export const createSchema = () => knex.schema
    .createTable('guilds', (t) => {
        t.string('id', 32).notNullable().primary().unique();
        t.string('prefix', 8);
        t.boolean('auto_sync');
        t.string('sync_channel_id', 32);
        t.string('log_channel_id', 32);
    })
    .createTable('role_permission_overrides', (t) => {
        t.string('guildId', 32).notNullable();
        t.string('roleId', 32).notNullable();
        t.string('commandName', 32).notNullable();
        t.boolean('allow').notNullable();

        t.foreign('guildId').references('guilds.id');
        t.unique(['guildId', 'roleId', 'commandName']);
    })
    .createTable('user_permission_overrides', (t) => {
        t.string('guildId', 32).notNullable();
        t.string('userId', 32).notNullable();
        t.string('commandName', 32).notNullable();
        t.boolean('allow').notNullable();

        t.foreign('guildId').references('guilds.id');
        t.unique(['guildId', 'userId', 'commandName']);
    })
    .then(() => console.log(' * Schema created.'))
    .catch((err: any) => {
        if (!err.toString().toLowerCase().includes('table `guilds` already exists')) {
            throw new Error(` ! ERROR while creating schema: ${err}`);
        }
    });

export const dropSchema = () => knex.schema
    .dropTableIfExists('guilds')
    .then(() => console.log(' * Dropped tables.'))
    .catch((err: any) => {
        console.log(err);
    });