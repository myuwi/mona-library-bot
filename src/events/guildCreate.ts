import { Guild } from 'discord.js';
import { MClient } from '../client/MClient';

export const guildCreate = async (client: MClient, guild: Guild) => {
  console.log(`Joined the guild ${guild.name}`);
  client.db.guilds.insert(guild.id);
};
