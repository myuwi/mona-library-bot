import {
  ChannelType,
  Collection,
  EmbedBuilder,
  Guild,
  Message,
  MessageEditOptions,
  TextChannel,
} from "discord.js";
import { colors } from "../colors";
import { config } from "../config";
import { Client } from "../lib/Client";
import { sleep } from "../utils";
import { Combo } from "./ComboLibrary/Combo";
import { ComboLibraryElement } from "./ComboLibrary/ComboLibraryElement";
import { getComboLibrary } from "./ComboLibraryParser";

export enum LibraryStatuses {
  NOT_FOUND = "NOT_FOUND",
  UP_TO_DATE = "UP_TO_DATE",
  OUT_OF_DATE = "OUT_OF_DATE",
  CHANNEL_NOT_SET = "CHANNEL_NOT_SET",
  LENGTH_MISMATCH = "LENGTH_MISMATCH",
}

export enum LibraryUpdateResponse {
  ALREADY_UP_TO_DATE = "ALREADY_UP_TO_DATE",
  CHANNEL_NOT_SET = "CHANNEL_NOT_SET",
  UPDATED = "UPDATED",
}

export enum LibraryPurgeResponse {
  CHANNEL_NOT_SET = "CHANNEL_NOT_SET",
  EMPTY = "NOT_FOUND",
  SUCCESS = "SUCCESS",
}

async function getChannel(guild: Guild, channelType: "directory" | "library") {
  const guildSettings = config[guild.id];

  const channelId = guildSettings?.[`${channelType}ChannelId`];
  if (!channelId) {
    return undefined;
  }

  const channel = await guild.channels.fetch(channelId);
  if (channel?.type !== ChannelType.GuildText)
    throw new Error("Sync channel is not a text channel.");

  return channel;
}

async function getLibraryChannel(guild: Guild) {
  return await getChannel(guild, "library");
}

async function getDirectoryChannel(guild: Guild) {
  return await getChannel(guild, "directory");
}

async function getEmbedMessages(client: Client, channel: TextChannel) {
  const messageCollection = await channel.messages.fetch();
  messageCollection.sweep((m) => {
    if (m.author.id !== client.user!.id) return true;
    if (!m.embeds[0]) return true;

    const embedDesc = m.embeds[0].description;
    if (!!embedDesc && embedDesc.includes("View on Google Docs")) return false;

    const lastFieldValue =
      m.embeds[0].fields[m.embeds[0].fields.length - 1]?.value;
    if (!!lastFieldValue && lastFieldValue.includes("View on Google Docs"))
      return false;

    return true;
  });

  return messageCollection;
}

function getLibraryStatusDiff(
  messageCollection: Collection<String, Message>,
  libraryElements: ComboLibraryElement<any>[]
) {
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
    const e = libraryElements[i]!;

    if (!e.compareTo(new Combo(embeds[i]!))) {
      diff.push([i, messages[i]!]);
    }
  }

  if (!diff.length) return { status: LibraryStatuses.UP_TO_DATE };

  return {
    status: LibraryStatuses.OUT_OF_DATE,
    diff: diff,
  };
}

export async function updateLibrary(client: Client, guild: Guild) {
  const channel = await getLibraryChannel(guild);
  if (!channel) return LibraryUpdateResponse.CHANNEL_NOT_SET;
  const messageCollection = await getEmbedMessages(client, channel);

  const comboLibraryElements = (await getComboLibrary())?.flatten();
  if (!comboLibraryElements)
    throw new Error("Combo Library could not be loaded");

  // Send embeds if the channel is empty
  if (!messageCollection.size) {
    for (const comboLibraryElement of comboLibraryElements) {
      const messageOptions = await comboLibraryElement.toMessageOptions();
      await channel.send(messageOptions);
      await sleep(1000);
    }

    return LibraryUpdateResponse.UPDATED;
  }

  const res = getLibraryStatusDiff(messageCollection, comboLibraryElements);

  switch (res.status) {
    case LibraryStatuses.UP_TO_DATE:
      return LibraryUpdateResponse.ALREADY_UP_TO_DATE;

    case LibraryStatuses.OUT_OF_DATE:
      const { diff } = res;
      console.log(res);
      if (!diff) return LibraryUpdateResponse.ALREADY_UP_TO_DATE;

      for (let i = 0; i < diff.length; i++) {
        const [comboIndex, message] = diff[i]!;
        console.log(`Updating ${comboIndex}`);

        const edit = {
          attachments: [],
          ...(await comboLibraryElements[comboIndex]!.toMessageOptions()),
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
        const messageOptions = await comboLibraryElements[
          i
        ]!.toMessageOptions();
        await channel.send(messageOptions);
        if (i < comboLibraryElements.length) await sleep(1000);
      }
      return LibraryUpdateResponse.UPDATED;

    default:
      throw new Error(`This should never happen: ${res}`);
  }
}

export async function getLibraryStatus(client: Client, guild: Guild) {
  const channel = await getLibraryChannel(guild);
  if (!channel) return LibraryStatuses.CHANNEL_NOT_SET;
  const messageCollection = await getEmbedMessages(client, channel);

  const comboLibraryElements = (await getComboLibrary())?.flatten();
  if (!comboLibraryElements)
    throw new Error("Combo Library could not be loaded");

  const res = getLibraryStatusDiff(messageCollection, comboLibraryElements);

  console.log(res);

  return res.status;
}

export async function purgeLibrary(client: Client, guild: Guild) {
  const channel = await getLibraryChannel(guild);
  if (!channel) return LibraryPurgeResponse.CHANNEL_NOT_SET;
  const messageCollection = await getEmbedMessages(client, channel);

  if (!messageCollection.size) return LibraryPurgeResponse.EMPTY;

  const messages = [...messageCollection.values()];

  for (let i = 0; i < messages.length; i++) {
    const m = messages[i]!;

    await m.delete();

    if (i < messages.length - 1) await sleep(1000);
  }

  return LibraryPurgeResponse.SUCCESS;
}

export async function updateDirectory(client: Client, guild: Guild) {
  console.log("Updating Directory channel");
  const libraryChannel = await getLibraryChannel(guild);
  if (!libraryChannel) throw new Error("Library channel not set");
  const messageCollection = await getEmbedMessages(client, libraryChannel);

  const messages = [...messageCollection.values()].reverse();

  const infoEmbed = new EmbedBuilder()
    .setTitle("Mona's Combo Library Directory")
    .setColor(colors.primary)
    .setDescription(
      `This is a directory channel from where you can quickly access each combo that has been submitted to <#${libraryChannel.id}>.\n`
    );

  const comboSubmissionEmbed = new EmbedBuilder()
    .setTitle("How to submit a combo")
    .setColor(colors.primary)
    .setDescription(
      "To submit your combo to the combo library, go to <#816715309314342952> and follow the instructions on the [pinned message](https://discord.com/channels/780891070862196807/816715309314342952/816858472372764692)."
    )
    .setFooter({
      text: "If you're having trouble with your combo submission, feel free to ask for help in #questions.",
    });

  for (const message of messages) {
    const embed = message.embeds[0];

    if (!embed?.fields.length) {
      infoEmbed.data.description += `\n**${embed!.title}**\n`;
    } else {
      const messageLink = `https://discord.com/channels/${message.guildId!}/${message.channelId!}/${
        message.id
      }`;
      infoEmbed.data.description += `▸ [${embed.title!}](${messageLink})\n`;
    }
  }

  const directoryChannel = await getDirectoryChannel(guild);
  if (!directoryChannel) throw new Error("Directory channel not set");

  const directoryChannelMessages = await directoryChannel.messages.fetch();
  directoryChannelMessages.sweep((m) => {
    if (m.author.id !== client.user!.id) return true;
    if (!m.embeds.length) return true;
    if (m.embeds[0]?.title !== infoEmbed.data.title) return true;
    return false;
  });

  if (!directoryChannelMessages.size) {
    directoryChannel.send({ embeds: [infoEmbed, comboSubmissionEmbed] });
  } else {
    const msg = directoryChannelMessages.first();
    msg!.edit({ embeds: [infoEmbed, comboSubmissionEmbed] });
  }

  console.log("Updated Directory channel");
}
