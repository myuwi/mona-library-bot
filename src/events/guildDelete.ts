import { Guild } from 'discord.js';
import { MClient } from '../client/MClient';

export const guildDelete = async (client: MClient, guild: Guild) => {
    console.log(`Left the guild ${guild.name}`);
    // client.db.guilds.delete(guild.id);
};
