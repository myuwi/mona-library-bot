import { knex } from './knexfile';
import { DbGuild, DbRolePermissionOverride, DbUserPermissionOverride } from './schema';

export const db = {
    knex,
    guilds: {
        insert: async (guildId: string) => {
            try {
                const rows = await knex<DbGuild>('guilds').where({ id: guildId });

                if (rows.length) {
                    throw new Error('Insert failed - Guild already exists in the database');
                }

                await knex<DbGuild>('guilds').insert({ id: guildId });
                return true;
            } catch (err) {
                console.log(err);
                return false;
            }
        },
        delete: async (guildId: string) => {
            await knex<DbGuild>('guilds').where({ id: guildId }).del();
        },
        settings: {
            get: async (guildId: string) => {
                return await knex<DbGuild>('guilds').where('id', guildId).first();
            },
            getPrefix: async (guildId: string) => {
                const settings = await knex<DbGuild>('guilds').select('prefix').where('id', guildId).first();
                const prefix = settings?.prefix;

                return prefix ? prefix : null;
            },
            update: async (guildId: string, data: Partial<Omit<DbGuild, 'id'>>) => {
                if ('id' in data) return;

                await knex<DbGuild>('guilds').where({ id: guildId }).update(data);
            },
        },
        permissions: {
            roles: {
                get: async (guildId: string) => {
                    return await knex<DbRolePermissionOverride>('role_permission_overrides').where({ guildId });
                },
                getByRoleId: async (guildId: string, roleId: string) => {
                    return await knex<DbRolePermissionOverride>('role_permission_overrides').where({
                        guildId,
                        roleId,
                    });
                },
                update: async (guildId: string, roleId: string, commandName: string, allow: boolean | null) => {
                    if (allow === null) {
                        await knex<DbRolePermissionOverride>('role_permission_overrides')
                            .where({
                                guildId,
                                roleId,
                                commandName,
                            })
                            .del();
                        return;
                    }

                    const row = await knex<DbRolePermissionOverride>('role_permission_overrides')
                        .where({
                            guildId,
                            roleId,
                            commandName,
                        })
                        .first();

                    // Insert
                    if (!row) {
                        await knex<DbRolePermissionOverride>('role_permission_overrides').insert({
                            guildId,
                            roleId,
                            commandName,
                            allow,
                        });
                        return;
                    }

                    // Identical override already exists
                    if (row.allow === allow) return;

                    await knex<DbRolePermissionOverride>('role_permission_overrides')
                        .where({
                            guildId,
                            roleId,
                            commandName,
                        })
                        .update({ allow });
                },
            },
            users: {
                get: async (guildId: string) => {
                    return await knex<DbUserPermissionOverride>('user_permission_overrides').where({ guildId });
                },
                getByUserId: async (guildId: string, userId: string) => {
                    return await knex<DbUserPermissionOverride>('user_permission_overrides').where({
                        guildId,
                        userId,
                    });
                },
                update: async (guildId: string, userId: string, commandName: string, allow: boolean | null) => {
                    if (allow === null) {
                        await knex<DbUserPermissionOverride>('user_permission_overrides')
                            .where({
                                guildId,
                                userId,
                                commandName,
                            })
                            .del();
                        return;
                    }

                    const row = await knex<DbUserPermissionOverride>('user_permission_overrides')
                        .where({
                            guildId,
                            userId,
                            commandName,
                        })
                        .first();

                    // Insert
                    if (!row) {
                        await knex<DbUserPermissionOverride>('user_permission_overrides').insert({
                            guildId,
                            userId,
                            commandName,
                            allow,
                        });
                        return;
                    }

                    // Identical override already exists
                    if (row.allow === allow) return;

                    await knex<DbUserPermissionOverride>('user_permission_overrides')
                        .where({
                            guildId,
                            userId,
                            commandName,
                        })
                        .update({ allow });
                },
            },
        },
    },
};
