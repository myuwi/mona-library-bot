import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.table('guilds', (t) => {
        t.string('directory_channel_id', 32);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.table('guilds', (t) => {
        t.dropColumn('directory_channel_id');
    });
}
