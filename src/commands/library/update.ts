import { Message } from 'discord.js';
import { MClient } from '../../client/MClient';
import * as EmbedUtils from '../../structures/EmbedUtils';
import { LibraryUpdateResponse } from '../../structures/GuildComboLibraryManager';
import { PermissionLevel } from '../../structures/Permissions';
import { Command } from '../../types';

export const command: Command = {
  name: 'update',
  description: 'Update the combo library',
  aliases: [],
  group: 'Library',
  usage: 'update <directory>',
  permissionLevel: PermissionLevel.HELPER,
  run: async (message: Message, args: string[], client: MClient) => {
    const guildLibraryManager = await client.comboLibraryManager.fetch(message.guild!);

    if (!guildLibraryManager) {
      return await message.channel.send({
        embeds: [EmbedUtils.error('Unble to get combo library configuration for the current server')],
      });
    }

    if (args[0] === 'directory') {
      try {
        const statusMessage = await message.channel.send({ embeds: [EmbedUtils.info('Updating directory channel...')] });
        await guildLibraryManager.updateDirectory();
        await statusMessage.edit({ embeds: [EmbedUtils.success('Directory channel updated')] });
      } catch (err: any) {
        if (err.message === 'Library channel not set') {
          return await message.channel.send({ embeds: [EmbedUtils.error('Library channel is not set')] });
        }
        console.error(err.toString());
        return await message.channel.send({
          embeds: [EmbedUtils.error('Unable to update directory channel: ' + err.message)],
        });
      }
    }

    try {
      const statusMessage = await message.channel.send({ embeds: [EmbedUtils.info('Updating library channel...')] });

      const status = await guildLibraryManager.update();

      if (status === LibraryUpdateResponse.UPDATED) {
        try {
          await statusMessage.edit({ embeds: [EmbedUtils.info('Updating directory channel...')] });
          await guildLibraryManager.updateDirectory();
        } catch (err: any) {
          if (err.message !== 'Library channel not set') {
            console.error(err.toString());
            await message.channel.send({
              embeds: [EmbedUtils.error('Unable to update directory channel: ' + err.message)],
            });
          }
        }
      }

      const messages = {
        [LibraryUpdateResponse.CHANNEL_NOT_SET]: EmbedUtils.error('The combo library channel has not been set on this server'),
        [LibraryUpdateResponse.ALREADY_UP_TO_DATE]: EmbedUtils.success('The combo library is already up to date, no update was performed'),
        [LibraryUpdateResponse.UPDATED]: EmbedUtils.success('The combo library channel has been updated succeessfully'),
      };

      if (messages[status]) {
        await statusMessage.edit({ embeds: [messages[status]] });
      }
    } catch (err: any) {
      console.error(err.toString());

      await message.channel.send({
        embeds: [EmbedUtils.error('Something went wrong with the library update, see error log for more information')],
      });
    }
  },
};
