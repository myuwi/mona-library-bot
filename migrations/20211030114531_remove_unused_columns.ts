import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.table('guilds', (t) => {
        t.dropColumn('auto_sync');
        t.dropColumn('log_channel_id');
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.table('guilds', (t) => {
        t.boolean('auto_sync');
        t.string('log_channel_id', 32);
    });
}
