import { Message, MessageAttachment, MessageEmbed, MessageOptions } from 'discord.js';
import { MClient } from '../../client/MClient';
import * as EmbedUtils from '../../structures/EmbedUtils';
import { Characters, parseCharacters } from '../../GenshinData';
import { ThumbnailGenerator } from '../../ThumbnailGenerator';
import { PermissionLevel } from '../../structures/Permissions';
import { Command } from '../../types';

export const command: Command = {
    name: 'team',
    description: 'Generate a team image',
    group: '',
    permissionLevel: PermissionLevel.BOT_OWNER,
    run: async (message: Message, args: string[], client: MClient) => {
        const teamRaw = args.join(' ').split(',').map((e) => e.trim());

        const team = [];
        for (let i = 0; i < teamRaw.length; i++) {
            const teamMember = teamRaw[i];

            for (let j = 0; j < Characters.length; j++) {
                const char = Characters[j];

                if (teamMember.toUpperCase().replace(' ', '').startsWith(char.name.toUpperCase().replace(' ', ''))
                    || char.displayName && teamMember.toUpperCase().replace(' ', '').startsWith(char.displayName.toUpperCase().replace(' ', ''))) {
                    team.push(char.name);
                    break;
                }
            }
        }

        const embed = new MessageEmbed()
            .setTitle(team.join(', '))
            .setColor(client.colors.primary);

        const messageOptions: MessageOptions = {
            embeds: [embed]
        };

        const chars = parseCharacters(team);
        const image = await ThumbnailGenerator.abyss(chars);

        if (!image) {
            return await message.channel.send({
                embeds: [
                    EmbedUtils.error('Invalid team')
                ]
            });
        }

        messageOptions.files = [new MessageAttachment(image, 'team.png')];
        embed.setImage('attachment://team.png');

        message.channel.send(messageOptions);
    }
};
