import { Message } from 'discord.js';
import chalk from 'chalk';
import { MClient } from '../client/MClient';
import * as EmbedUtils from '../structures/EmbedUtils';
import { testPermissions } from '../structures/Permissions';

export const event = async (client: MClient, message: Message) => {
    if (message.author.bot) return;
    if (message.channel.type !== 'GUILD_TEXT' || !message.guild) return;

    const prefix = (await client.db.guilds.settings.getPrefix(message.guild.id)) || client.config.defaultPrefix;

    const mention = `<@!${client.user!.id}>`;

    if (!message.content.startsWith(prefix) && !message.content.startsWith(mention)) return;

    const [commandName, ...args] = (
        message.content.startsWith(prefix) ? message.content.slice(prefix.length) : message.content.replace(mention, '')
    )
        .trim()
        .split(/ +/g);

    const command = client.commands.get(commandName);
    if (!command) return;

    const hasPermission = await testPermissions(command, message.member!);
    if (!hasPermission) {
        return await message.channel.send({ embeds: [EmbedUtils.error("You don't have permission to execute that command")] });
    }

    console.log(chalk.cyan(`[${message.guild.name}] ${message.author.tag} executed the ${commandName} command`));

    try {
        await command.run(message, args, client);
    } catch (err) {
        console.log(err);

        await message.channel.send({ embeds: [EmbedUtils.error('An unexpected error has occurred, please check the error log')] });
    }
};
