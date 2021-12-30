import { Message } from 'discord.js';
import { MClient } from '../../client/MClient';
import { Characters } from '../../GenshinData';
import { PermissionLevel } from '../../structures/Permissions';
import { Command } from '../../types';

export const command: Command = {
    name: 'characters',
    description: 'Print a list of the available characters and their aliases',
    aliases: ['chars'],
    group: 'Genshin',
    usage: 'characters',
    permissionLevel: PermissionLevel.HELPER,
    run: async (message: Message, args: string[], client: MClient) => {
        const chars = Characters.map((c) => {
            let aliases = [];
            if (c.displayName) aliases.push(c.displayName);
            if (c.aliases && c.aliases.length) aliases = [...aliases, ...c.aliases];

            let str = c.name;
            if (aliases.length) str += ` (${aliases.join(', ')})`;

            return `\`${str}\``;
        }).join(', ');

        await message.channel.send(`**List of available character names:**\n${chars}`);
    },
};
