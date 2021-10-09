import { Message } from 'discord.js';
import { MClient } from '../../client/MClient';
import { Command } from '../../types';

export const command: Command = {
    name: 'prefix',
    description: 'Manage prefix',
    ownerOnly: true,
    run: async (message: Message, args: string[], client: MClient) => {

        if (args[0] === 'set' && args[1]) {
            await client.db.updateGuildSettings(message.guild!.id, { prefix: args[1] });
            return message.channel.send(`The prefix has been changed to \`${args[1]}\``);
        }

        if (args[0] === 'unset' || args[0] === 'reset') {
            await client.db.updateGuildSettings(message.guild!.id, { prefix: null });
            return message.channel.send(`The prefix has been reset to default (\`${client.config.defaultPrefix}\`)`);
        }

        const prefix = (await client.db.getGuildSettings(message.guild!.id))?.prefix || client.config.defaultPrefix;

        message.channel.send(`The prefix on the current server is \`${prefix}\``);
    }
};
