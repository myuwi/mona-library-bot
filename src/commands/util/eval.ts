import { Formatters, Message } from 'discord.js';
import { inspect } from 'util';
import { MClient } from '../../client/MClient';
import { PermissionLevel } from '../../structures/Permissions';
import { Command } from '../../types';

export const command: Command = {
  name: 'eval',
  description: 'Evaluates Javascript code.',
  group: 'Util',
  usage: 'eval <javascript code>',
  examples: [
    {
      value: "eval return 'Hello World'",
      description: "Evaluates the code and returns 'Hello World'",
    },
  ],
  disabled: process.env.NODE_ENV !== 'development' ? true : false,
  permissionLevel: PermissionLevel.BOT_OWNER,
  hidden: true,
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

      await message.channel.send(Formatters.codeBlock(clean(evaled)));
    } catch (err: any) {
      // if (typeof err !== 'string') return console.log(err);

      await message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err.toString())}\n\`\`\``);
    }
  },
};
