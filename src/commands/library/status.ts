import { EmbedBuilder, Message } from 'discord.js';

import { MClient } from '../../client/MClient';
import * as EmbedUtils from '../../structures/EmbedUtils';
import { LibraryStatuses } from '../../structures/GuildComboLibraryManager';
import { PermissionLevel } from '../../structures/Permissions';
import { Command } from '../../types';

export const command: Command = {
  name: 'status',
  description: 'Get the status of the combo library',
  aliases: [],
  group: 'Library',
  usage: 'status',
  permissionLevel: PermissionLevel.HELPER,
  run: async (message: Message, args: string[], client: MClient) => {
    const guildLibraryManager = await client.comboLibraryManager.fetch(message.guild!);

    if (!guildLibraryManager) {
      return await message.channel.send({
        embeds: [EmbedUtils.error('Unble to get combo library configuration for the current server')],
      });
    }

    const statusMessage = await message.channel.send({
      embeds: [EmbedUtils.info('Checking library status, please wait...')],
    });

    const statusId = await guildLibraryManager.status();

    const guildSettings = await client.db.guilds.getOrInsert(message.guild!.id);

    let status: string;
    switch (statusId) {
      case LibraryStatuses.NOT_FOUND:
        status = 'Not synced';
        break;
      case LibraryStatuses.LENGTH_MISMATCH:
      case LibraryStatuses.OUT_OF_DATE:
        status = 'Out of Date';
        break;
      case LibraryStatuses.UP_TO_DATE:
        status = 'Up to date';
        break;
      case LibraryStatuses.CHANNEL_NOT_SET:
        status = 'Channel not set';
        break;
      default:
        status = 'Unknown';
    }

    const embed = new EmbedBuilder()
      .setTitle('Combo Library Status')
      .setColor(client.colors.primary)
      .setImage(
        'https://cdn.discordapp.com/attachments/809845587905871914/875084375333687296/Namecard_Background_Mona_Starry_Sky_188px.png'
      )
      .setFooter({ text: client.user!.username })
      .setTimestamp(Date.now())
      .addFields(
        { name: 'Status', value: status },
        { name: 'Library Channel', value: guildSettings?.syncChannelId ? `<#${guildSettings.syncChannelId}>` : 'Unset', inline: true },
        {
          name: 'Directory Channel',
          value: guildSettings?.directoryChannelId ? `<#${guildSettings.directoryChannelId}>` : 'Unset',
          inline: true,
        }
      );

    statusMessage.edit({ embeds: [embed] });
  },
};
