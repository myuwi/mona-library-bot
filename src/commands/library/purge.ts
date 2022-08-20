import { Message } from 'discord.js';
import { MClient } from '../../client/MClient';
import * as EmbedUtils from '../../structures/EmbedUtils';
import { LibraryPurgeResponse } from '../../structures/GuildComboLibraryManager';
import { PermissionLevel } from '../../structures/Permissions';
import { Command } from '../../types';

export const command: Command = {
  name: 'purge',
  description: 'Purge the combo library',
  aliases: [],
  group: 'Library',
  usage: 'purge',
  permissionLevel: PermissionLevel.MODERATOR,
  run: async (message: Message, args: string[], client: MClient) => {
    const guildLibraryManager = await client.comboLibraryManager.fetch(message.guild!);

    if (!guildLibraryManager) {
      return await message.channel.send({
        embeds: [EmbedUtils.error('Unble to get combo library configuration for the current server')],
      });
    }

    const statusMessage = await message.channel.send({
      embeds: [EmbedUtils.info('Purging the combo library, please wait...')],
    });

    const resId = await guildLibraryManager.purge();

    const messages = {
      [LibraryPurgeResponse.SUCCESS]: EmbedUtils.success('The combo library has been purged successfully'),
      [LibraryPurgeResponse.CHANNEL_NOT_SET]: EmbedUtils.error('The combo library channel has not been set on this server'),
      [LibraryPurgeResponse.NOT_FOUND]: EmbedUtils.error('Unable to purge the combo library channel, the channel is already empty'),
    };

    if (messages[resId]) {
      await statusMessage.edit({ embeds: [messages[resId]] });
    }
  },
};
