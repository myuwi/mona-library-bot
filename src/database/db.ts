import Knex from 'knex';
import { DbGuild } from './schema';

export const knex = Knex({
    client: 'sqlite3',
    useNullAsDefault: true,
    connection: {
        filename: './db.sqlite'
    }
});

export const db = {
    knex,
    insertGuild: async (guildId: string) => {
        try {
            const rows = await knex<DbGuild>('guilds')
                .select()
                .where({ id: guildId });

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
    deleteGuild: async (guildId: string) => {
        await knex<DbGuild>('guilds')
            .where({ id: guildId })
            .del();
    },
    updateGuildSettings: async (guildId: string, data: Partial<Omit<DbGuild, 'id'>>) => {
        if ('id' in data) return;

        await knex<DbGuild>('guilds')
            .where({ id: guildId })
            .update(data);
    },
    getGuildSettings: async (guildId: string) => {
        return await knex<DbGuild>('guilds').where('id', guildId).first();
    }
};
