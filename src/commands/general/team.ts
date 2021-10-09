import { Message, MessageAttachment, MessageEmbed, MessageOptions } from 'discord.js';
import { MClient } from '../../client/MClient';
import { GenshinData } from '../../GenshinData';
import { ThumbnailGenerator } from '../../structures/ThumbnailGenerator';
import { Command } from '../../types';

export const command: Command = {
    name: 'team',
    description: 'Generate a team image',
    usage: ['team'],
    run: async (message: Message, args: string[], client: MClient) => {
        const teamRaw = args.join(' ').split(',').map((e) => e.trim());

        const team = [];
        for (let i = 0; i < teamRaw.length; i++) {
            const teamMember = teamRaw[i];

            for (let j = 0; j < GenshinData.length; j++) {
                const characterData = GenshinData[j];

                if (teamMember.toUpperCase().replace(' ', '').startsWith(characterData.name.replace(' ', '').toUpperCase())) {
                    team.push(characterData.name);
                    break;
                }
            }
        }

        const embed = new MessageEmbed()
            .setTitle(team.join(', '))
            .setColor(client.config.colors.primary);

        const messageOptions: MessageOptions = {
            embeds: [embed]
        };

        const image = await ThumbnailGenerator.abyss(team);
        if (image) {
            messageOptions.files = [new MessageAttachment(image, 'team.png')];
            embed.setImage('attachment://team.png');

            message.channel.send(messageOptions);
        }
    }
};
