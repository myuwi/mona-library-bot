import { ChannelType, Collection, EmbedBuilder, Guild, Message, MessageEditOptions, TextChannel } from 'discord.js';

import { MClient } from '../client/MClient';
import { colors } from '../colors';
import { sleep } from '../utils';
import { Combo } from './ComboLibrary/Combo';
import { ComboLibraryElement } from './ComboLibrary/ComboLibraryElement';
import { ComboLibraryManager } from './ComboLibraryManager';

export enum LibraryStatuses {
  NOT_FOUND = 'NOT_FOUND',
  UP_TO_DATE = 'UP_TO_DATE',
  OUT_OF_DATE = 'OUT_OF_DATE',
  CHANNEL_NOT_SET = 'CHANNEL_NOT_SET',
  LENGTH_MISMATCH = 'LENGTH_MISMATCH',
}

export enum LibraryUpdateResponse {
  CHANNEL_NOT_SET = 'CHANNEL_NOT_SET',
  ALREADY_UP_TO_DATE = 'ALREADY_UP_TO_DATE',
  UPDATED = 'UPDATED',
}

export enum LibraryPurgeResponse {
  NOT_FOUND = 'NOT_FOUND',
  CHANNEL_NOT_SET = 'CHANNEL_NOT_SET',
  SUCCESS = 'SUCCESS',
}

export class GuildComboLibraryManager {
  private client: MClient;
  private comboLibraryManager: ComboLibraryManager;
  private guild: Guild;

  constructor(client: MClient, comboLibraryManager: ComboLibraryManager, guild: Guild) {
    this.client = client;
    this.comboLibraryManager = comboLibraryManager;
    this.guild = guild;
  }

  private async getLibraryChannel() {
    const guildSettings = await this.client.db.guilds.getOrInsert(this.guild.id);

    if (!guildSettings) {
      throw new Error('Guild settings not found.');
    }

    if (!guildSettings.syncChannelId) {
      return undefined;
    }

    try {
      const channel = await this.guild.channels.fetch(guildSettings.syncChannelId);
      if (channel?.type !== ChannelType.GuildText) throw new Error('Sync channel is not a text channel.');

      return channel;
    } catch (err) {
      return undefined;
    }
  }

  private async getDirectoryChannel() {
    const guildSettings = await this.client.db.guilds.getOrInsert(this.guild.id);

    if (!guildSettings) {
      throw new Error('Guild settings not found.');
    }

    if (!guildSettings.directoryChannelId) {
      return undefined;
    }

    try {
      const channel = await this.guild.channels.fetch(guildSettings.directoryChannelId);
      if (channel?.type !== ChannelType.GuildText) throw new Error('Directory channel is not a text channel.');

      return channel;
    } catch (err) {
      return undefined;
    }
  }

  private async getEmbedMessages(channel: TextChannel) {
    const messageCollection = await channel.messages.fetch();
    messageCollection.sweep((m) => {
      if (m.author.id !== this.client.user!.id) return true;
      if (!m.embeds.length) return true;

      const embedDesc = m.embeds[0].description;
      if (!!embedDesc && embedDesc.includes('View on Google Docs')) return false;

      const lastFieldValue = m.embeds[0].fields[m.embeds[0].fields.length - 1]?.value;
      if (!!lastFieldValue && lastFieldValue.includes('View on Google Docs')) return false;

      return true;
    });

    return messageCollection;
  }

  private getLibraryStatus(messageCollection: Collection<String, Message>, libraryElements: ComboLibraryElement<any>[]) {
    if (!messageCollection.size)
      return {
        status: LibraryStatuses.NOT_FOUND,
      };

    // console.log(messageCollection);
    const messages = [...messageCollection.values()].reverse();
    const embeds = messages.map((m) => m.embeds[0]);

    // console.log(embeds);

    if (embeds.length !== libraryElements.length) {
      return { status: LibraryStatuses.LENGTH_MISMATCH };
    }

    const diff: [number, Message][] = [];

    for (let i = 0; i < libraryElements.length; i++) {
      const e = libraryElements[i];
      if (!e.compareTo(new Combo(embeds[i]))) {
        diff.push([i, messages[i]]);
      }
    }

    if (!diff.length) return { status: LibraryStatuses.UP_TO_DATE };

    return {
      status: LibraryStatuses.OUT_OF_DATE,
      diff: diff,
    };
  }

  public async update() {
    const channel = await this.getLibraryChannel();
    if (!channel) return LibraryUpdateResponse.CHANNEL_NOT_SET;
    const messageCollection = await this.getEmbedMessages(channel);

    const comboLibraryElements = (await this.comboLibraryManager.getComboLibrary())?.flatten();
    if (!comboLibraryElements) throw new Error('Combo Library could not be loaded');

    // Send embeds if the channel is empty
    if (!messageCollection.size) {
      for (let i = 0; i < comboLibraryElements.length; i++) {
        const messageOptions = await comboLibraryElements[i].toMessageOptions();
        await channel.send(messageOptions);
        await sleep(1000);
      }

      return LibraryUpdateResponse.UPDATED;
    }

    const res = this.getLibraryStatus(messageCollection, comboLibraryElements);

    switch (res.status) {
      case LibraryStatuses.UP_TO_DATE:
        return LibraryUpdateResponse.ALREADY_UP_TO_DATE;

      case LibraryStatuses.OUT_OF_DATE:
        const { diff } = res;
        console.log(res);
        if (!diff) return LibraryUpdateResponse.ALREADY_UP_TO_DATE;

        for (let i = 0; i < diff.length; i++) {
          const [comboIndex, message] = diff[i];
          console.log(`Updating ${comboIndex}`);

          const edit = {
            attachments: [],
            ...(await comboLibraryElements[comboIndex].toMessageOptions()),
          } as MessageEditOptions;

          await message.edit(edit);
          if (i < diff.length) await sleep(1000);
        }

        return LibraryUpdateResponse.UPDATED;

      case LibraryStatuses.LENGTH_MISMATCH:
        for (const m of messageCollection.values()) {
          await m.delete();
          await sleep(1000);
        }

        for (let i = 0; i < comboLibraryElements.length; i++) {
          const messageOptions = await comboLibraryElements[i].toMessageOptions();
          await channel.send(messageOptions);
          if (i < comboLibraryElements.length) await sleep(1000);
        }
        return LibraryUpdateResponse.UPDATED;

      default:
        throw new Error(`Switch statement default case reached ${res}`);
    }
  }

  public async status() {
    const channel = await this.getLibraryChannel();
    if (!channel) return LibraryStatuses.CHANNEL_NOT_SET;
    const messageCollection = await this.getEmbedMessages(channel);

    const comboLibraryElements = (await this.comboLibraryManager.getComboLibrary())?.flatten();
    if (!comboLibraryElements) throw new Error('Combo Library could not be loaded');

    const res = this.getLibraryStatus(messageCollection, comboLibraryElements);

    console.log(res);

    return res.status;
  }

  public async purge(deleteCallback?: (i?: number, messages?: Message[]) => unknown | Promise<unknown>) {
    const channel = await this.getLibraryChannel();
    if (!channel) return LibraryPurgeResponse.CHANNEL_NOT_SET;
    const messageCollection = await this.getEmbedMessages(channel);

    if (!messageCollection.size) return LibraryPurgeResponse.NOT_FOUND;

    const messages = [...messageCollection.values()];

    for (let i = 0; i < messages.length; i++) {
      const m = messages[i];

      await m.delete();

      if (i < messages.length - 1) await sleep(1000);

      !!deleteCallback && (await deleteCallback(i, messages));
    }

    return LibraryPurgeResponse.SUCCESS;
  }

  public async purgeDirectory(deleteCallback?: (i?: number, messages?: Message[]) => unknown | Promise<unknown>) {
    const directoryChannel = await this.getDirectoryChannel();
    if (!directoryChannel) return LibraryPurgeResponse.CHANNEL_NOT_SET;

    const directoryChannelMessages = await directoryChannel.messages.fetch();
    directoryChannelMessages.sweep((m) => {
      if (m.author.id !== this.client.user!.id) return true;
      if (!m.embeds.length) return true;
      return false;
    });

    if (!directoryChannelMessages.size) return LibraryPurgeResponse.NOT_FOUND;

    const messages = [...directoryChannelMessages.values()];

    for (let i = 0; i < messages.length; i++) {
      const m = messages[i];

      await m.delete();

      if (i < messages.length - 1) await sleep(1000);

      !!deleteCallback && (await deleteCallback(i, messages));
    }

    return LibraryPurgeResponse.SUCCESS;
  }

  public async updateDirectory() {
    console.log('Updating Directory channel');
    const libraryChannel = await this.getLibraryChannel();
    if (!libraryChannel) throw new Error('Library channel not set');
    const messageCollection = await this.getEmbedMessages(libraryChannel);

    const messages = [...messageCollection.values()].reverse();

    const infoEmbed = new EmbedBuilder()
      .setTitle("Mona's Combo Library Directory")
      .setColor(colors.primary)
      .setDescription(
        `This is a directory channel from where you can quickly access each combo that has been submitted to <#${libraryChannel.id}>.\n`
      );

    const comboSubmissionEmbed = new EmbedBuilder()
      .setTitle('How to submit a combo')
      .setColor(colors.primary)
      .setDescription(
        'To submit your combo to the combo library, go to <#816715309314342952> and follow the instructions on the [pinned message](https://discord.com/channels/780891070862196807/816715309314342952/816858472372764692).'
      )
      .setFooter({
        text: "If you're having trouble with your combo submission, feel free to ask for help in #questions.",
      });

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      const embed = message.embeds[0];

      if (!embed.fields.length) {
        infoEmbed.data.description += `\n**${embed.title!}**\n`;
      } else {
        const messageLink = `https://discord.com/channels/${message.guildId!}/${message.channelId!}/${message.id}`;
        infoEmbed.data.description += `▸ [${embed.title!}](${messageLink})\n`;
      }
    }

    const directoryChannel = await this.getDirectoryChannel();
    if (!directoryChannel) throw new Error('Directory channel not set');

    const directoryChannelMessages = await directoryChannel.messages.fetch();
    directoryChannelMessages.sweep((m) => {
      if (m.author.id !== this.client.user!.id) return true;
      if (!m.embeds.length) return true;
      if (m.embeds[0].title !== infoEmbed.data.title) return true;
      return false;
    });

    if (!directoryChannelMessages.size) {
      directoryChannel.send({ embeds: [infoEmbed, comboSubmissionEmbed] });
    } else {
      const msg = directoryChannelMessages.first();
      msg!.edit({ embeds: [infoEmbed, comboSubmissionEmbed] });
    }

    console.log('Updated Directory channel');
  }
}
