import { ChannelType, Message } from 'discord.js';

import { MClient } from '../../client/MClient';
import * as EmbedUtils from '../../structures/EmbedUtils';
import { PermissionLevel } from '../../structures/Permissions';
import { Command } from '../../types';

export const command: Command = {
  name: 'channel',
  description: 'Manage the combo library on the current server',
  aliases: [],
  group: 'Library',
  usage: 'channel <library | directory> <set <channel id> | unset>',
  permissionLevel: PermissionLevel.MODERATOR,
  run: async (message: Message, args: string[], client: MClient) => {
    const guildLibraryManager = await client.comboLibraryManager.fetch(message.guild!);

    if (!guildLibraryManager) {
      return await message.channel.send({
        embeds: [EmbedUtils.error('Unble to get combo library configuration for the current server')],
      });
    }

    const dbColNames: Record<string, string> = {
      library: 'syncChannelId',
      directory: 'directoryChannelId',
    };

    if (!(args[0] in dbColNames)) {
      return await message.channel.send({
        embeds: [EmbedUtils.error(`Usage: ${command.usage}`)],
      });
    }

    const dbCol = dbColNames[args[0]];

    switch (args[1]) {
      case 'set':
        if (!args[2]) {
          return message.channel.send({ embeds: [EmbedUtils.error('A channel id is required')] });
        }

        if (!/^\d+$/.test(args[2])) {
          return message.channel.send({ embeds: [EmbedUtils.error('Invalid channel id')] });
        }

        let channelId;
        try {
          const fChannels = await message.guild!.channels.fetch();

          const fChannel = fChannels.get(args[2]);

          if (!fChannel) {
            return message.channel.send({
              embeds: [EmbedUtils.error('A channel with the specified id could not be found on this server')],
            });
          }

          if (fChannel.type !== ChannelType.GuildText) {
            return message.channel.send({
              embeds: [EmbedUtils.error("The channel with the specified id isn't a text channel")],
            });
          }

          channelId = fChannel.id;
        } catch (err: any) {
          console.log(err);
          return message.channel.send({
            embeds: [EmbedUtils.error('An unspecified error occurred, check the error log')],
          });
        }

        await client.db.guilds.update(message.guild!.id, { [dbCol]: channelId });

        return await message.channel.send({
          embeds: [EmbedUtils.success(`The \`${args[0]}\` channel has been set to <#${channelId}>`)],
        });
      case 'unset':
        const statusMessage = await message.channel.send({
          embeds: [EmbedUtils.info('Clearing channel, please wait...')],
        });

        switch (args[0]) {
          case 'library':
            await guildLibraryManager.purge();
            break;
          case 'directory':
            await guildLibraryManager.purgeDirectory();
            break;
        }

        await client.db.guilds.update(message.guild!.id, { [dbCol]: null });

        return statusMessage.edit({ embeds: [EmbedUtils.success(`The \`${args[0]}\` channel has been unbound`)] });
      default:
        await message.channel.send({
          embeds: [EmbedUtils.error(`Usage: ${command.usage}`)],
        });
    }
  },
};
