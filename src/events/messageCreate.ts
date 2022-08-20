import { Message } from 'discord.js';
import chalk from 'chalk';
import { MClient } from '../client/MClient';
import * as EmbedUtils from '../structures/EmbedUtils';
import { testPermissions } from '../structures/Permissions';

export const messageCreate = async (client: MClient, message: Message) => {
  if (message.author.bot) return;
  if (message.channel.type !== 'GUILD_TEXT' || !message.guild) return;

  const prefix = (await client.db.guilds.getOrInsert(message.guildId!)).prefix || client.config.defaultPrefix;

  const mention = `<@!${client.user!.id}>`;

  const matchesPrefix = message.content.toUpperCase().startsWith(prefix.toUpperCase());
  if (!matchesPrefix && !message.content.startsWith(mention)) return;

  const [commandName, ...args] = (matchesPrefix ? message.content.slice(prefix.length) : message.content.replace(mention, ''))
    .trim()
    .split(/ +/g);

  const command = client.commands.get(commandName);
  if (!command) return;

  const hasPermission = await testPermissions(command, message.member!);
  if (!hasPermission) {
    return;
    // return await message.channel.send({ embeds: [EmbedUtils.error("You don't have permission to execute that command")] });
  }

  console.log(chalk.cyan(`[${message.guild.name}] ${message.author.tag} executed the ${command.name} command`));

  try {
    await command.run(message, args, client);
  } catch (err) {
    console.log(err);

    await message.channel.send({ embeds: [EmbedUtils.error('An unexpected error has occurred, please check the error log')] });
  }
};
