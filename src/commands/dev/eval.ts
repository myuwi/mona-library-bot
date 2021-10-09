import { Formatters, Message } from 'discord.js';
import { Command } from '../../types';
import { inspect } from 'util';
import { MClient } from '../../client/MClient';

export const command: Command = {
    name: 'eval',
    description: 'Evaluate code.',
    usage: ['eval return "Hello World"'],
    disabled: process.env.NODE_ENV !== 'development' ? false : true,
    hidden: true,
    ownerOnly: true,
    run: async (message: Message, args: string[], client: MClient) => {
        if (message.author.id !== client.config.ownerId) return;

        const clean = (text: string) => {
            if (typeof text === 'string') {
                return text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203));
            } else {
                return text;
            }
        };

        try {
            const code = args.join(' ');
            let evaled = await eval('(async () => {' + code + '})()');

            if (typeof evaled !== 'string') evaled = inspect(evaled);

            message.channel.send(Formatters.codeBlock(clean(evaled)));
        } catch (err: any) {
            // if (typeof err !== 'string') return console.log(err);

            message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err.toString())}\n\`\`\``);
        }
    }
};