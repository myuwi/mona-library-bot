import { Message, MessageAttachment, MessageEmbed, MessageOptions } from 'discord.js';
import { MClient } from '../../client/MClient';
import * as EmbedUtils from '../../structures/EmbedUtils';
import { Characters, Elements, parseTeam } from '../../GenshinData';
import { ThumbnailGenerator } from '../../ThumbnailGenerator';
import { PermissionLevel } from '../../structures/Permissions';
import { Command } from '../../types';

export const command: Command = {
    name: 'team',
    description: 'Generate a team image',
    group: 'Genshin',
    permissionLevel: PermissionLevel.HELPER,
    run: async (message: Message, args: string[], client: MClient) => {
        if (!args.length || args[0] === 'help') {
            const elements = Object.values(Elements)
                .map((e) => `\`${e.name}\``)
                .join(', ');

            const chars = Characters.map((c) => {
                let aliases = [];
                if (c.displayName) aliases.push(c.displayName);
                if (c.aliases && c.aliases.length) aliases = [...aliases, ...c.aliases];

                let str = c.name;
                if (aliases.length) str += ` (${aliases.join(', ')})`;

                return `\`${str}\``;
            }).join(', ');

            return await message.channel.send(`**Available elements:**\n${elements}\n\n**Available character names:**\n${chars}`);
        }

        const teamRaw = args
            .join('')
            .split(',')
            .map((e) => e.trim());

        const chars = parseTeam(teamRaw);

        const msg = await message.channel.send({ embeds: [EmbedUtils.info('Generating image...')] });

        const image = await ThumbnailGenerator.abyss(chars);

        if (!image) {
            return await message.channel.send({
                embeds: [EmbedUtils.error('Invalid team')],
            });
        }

        const embed = new MessageEmbed({
            title: chars.map((c) => c.name).join(', '),
            color: client.colors.primary,
        });

        const imageName = chars
            .map((m) => {
                const name = ('displayName' in m && m.displayName) || m.name;
                return name.toLowerCase().replace(' ', '');
            })
            .join('-');

        const messageOptions: MessageOptions = {
            embeds: [embed],
            files: [new MessageAttachment(image, `${imageName}.png`)],
        };

        embed.setImage(`attachment://${imageName}.png`);

        await msg.edit(messageOptions);
    },
};
