import { Collection, Message, MessageEmbed } from 'discord.js';
import { MClient } from '../../client/MClient';
import { PermissionLevel } from '../../structures/Permissions';
import { Command } from '../../types';

export const command: Command = {
    name: 'help',
    description: 'A command to get help',
    group: 'General',
    usage: 'help [command]',
    examples: [
        {
            value: 'help',
            description: 'Shows a list of all commands'
        },
        {
            value: 'help prefix',
            description: 'Shows help for the prefix command'
        }
    ],
    permissionLevel: PermissionLevel.MEMBER,
    run: async (message: Message, args: string[], client: MClient) => {
        const command = args[0] && client.commands.get(args[0]);
        const prefix = await client.db.guilds.settings.getPrefix(message.guildId!) || client.config.defaultPrefix;

        if (command) {
            const embed = new MessageEmbed()
                .setAuthor(`Help for ${command.name}`, client.user!.avatarURL()!)
                .setColor(client.colors.primary)
                .setDescription(command.description);

            if (command.usage) {
                embed.addField('Usage', `\`${prefix}${command.usage}\``);
            }

            if (command.examples?.length) {
                const examples = command.examples.map((s) => `\`${prefix}${s.value}\`\n${s.description}`).join('\n\n');
                embed.addField('Examples', examples);
            }

            if (command.aliases?.length) {
                const aliases = command.aliases.map((s) => `\`${s}\``).join('\n');
                embed.addField('Aliases', aliases);
            }

            return message.channel.send({ embeds: [embed] });
        }

        const embed = new MessageEmbed()
            .setAuthor('Command Help', client.user!.avatarURL()!)
            .setColor(client.colors.primary)
            .setFooter(`Type ${prefix}help [command] for more info.`);

        const groupedCommands = new Collection<String, Command[]>();

        const commands = client.commands.toArray()
            .filter((c) => !c.hidden);

        for (let i = 0; i < commands.length; i++) {
            const command = commands[i];
            if (groupedCommands.has(command.group)) {
                groupedCommands.get(command.group)!.push(command);
            } else {
                groupedCommands.set(command.group, [command]);
            }
        }

        for (const group of [...groupedCommands.values()]) {
            const cmds = group
                .map((cmd) => {
                    return `\`${cmd.name}\``;
                }).join(' ');

            embed.addField(`${group[0].group} Commands`, cmds);
        }

        return message.channel.send({ embeds: [embed] });
    }
};