import { Message } from 'discord.js';
import { MClient } from '../../client/MClient';
import { PermissionLevel } from '../../structures/Permissions';
import { Command } from '../../types';

import util from 'util';
import child_process from 'child_process';
const exec = util.promisify(child_process.exec);

export const command: Command = {
  name: 'version',
  description: 'A command to get help',
  group: 'General',
  usage: 'version',
  permissionLevel: PermissionLevel.BOT_OWNER,
  run: async (message: Message, args: string[], client: MClient) => {
    const revision = (await exec('git rev-parse HEAD')).stdout.slice(0, 7).trim();
    await message.channel.send(`Currently running \`v${client.version} (${revision})\``);
  },
};
