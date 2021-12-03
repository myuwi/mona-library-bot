import { Message, MessageAttachment, MessageEmbed, MessageOptions } from 'discord.js';
import { MClient } from '../../client/MClient';
import * as EmbedUtils from '../../structures/EmbedUtils';
import { parseCharacters } from '../../GenshinData';
import { ThumbnailGenerator } from '../../ThumbnailGenerator';
import { PermissionLevel } from '../../structures/Permissions';
import { Command } from '../../types';

export const command: Command = {
    name: 'team',
    description: 'Generate a team image',
    group: '',
    permissionLevel: PermissionLevel.BOT_OWNER,
    run: async (message: Message, args: string[], client: MClient) => {
        const teamRaw = args
            .join('')
            .split(',')
            .map((e) => e.trim());

        const chars = parseCharacters(teamRaw);
        const image = await ThumbnailGenerator.abyss(chars);

        if (!image) {
            return await message.channel.send({
                embeds: [EmbedUtils.error('Invalid team')],
            });
        }

        const embed = new MessageEmbed().setTitle(chars.map((c) => c.name).join(', ')).setColor(client.colors.primary);

        const messageOptions: MessageOptions = {
            embeds: [embed],
            files: [new MessageAttachment(image, 'team.png')],
        };

        embed.setImage('attachment://team.png');

        message.channel.send(messageOptions);
    },
};
