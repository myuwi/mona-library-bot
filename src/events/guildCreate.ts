import { Guild } from 'discord.js';
import { MClient } from '../client/MClient';

export const event = async (client: MClient, guild: Guild) => {
    client.db.insertGuild(guild.id);
};
