import { Message } from 'discord.js';
import { Command } from '../../types';

export const command: Command = {
    name: 'ping',
    description: 'Ping',
    run: async (message: Message, args: string[]) => {
        const date = Date.now();
        const msg = await message.channel.send('Pinging...');
        if (!msg) return;
        const ping = Date.now() - date;

        msg.edit(`Ping: ${ping} ms`);
    }
};
