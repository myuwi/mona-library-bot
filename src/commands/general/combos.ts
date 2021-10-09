import { Message } from 'discord.js';
import { MClient } from '../../client/MClient';
import { ComboLibraryManager } from '../../structures/ComboLibraryManager';
import { Command } from '../../types';

export const command: Command = {
    name: 'combos',
    description: 'Show a list of available combos',
    usage: ['combos'],
    run: async (message: Message, args: string[], client: MClient) => {
        const doc = await client.comboLib.parseDoc();

        if (!doc) return message.channel.send('Can\'t open doc');

        const comboLib = ComboLibraryManager.parseCombos(doc);

        const embed = await ComboLibraryManager.toDiscordDirectory(comboLib);

        message.channel.send({ embeds: [embed] });
    }
};
