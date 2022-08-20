import { Message } from 'discord.js';
import { PermissionLevel } from '../../structures/Permissions';
import { Command } from '../../types';

export const command: Command = {
  name: 'ping',
  description: 'Ping',
  group: 'Util',
  permissionLevel: PermissionLevel.MEMBER,
  run: async (message: Message, args: string[]) => {
    const date = Date.now();
    const msg = await message.channel.send('Pinging...');
    if (!msg) return;
    const ping = Date.now() - date;

    msg.edit(`Ping: ${ping} ms`);
  },
};
