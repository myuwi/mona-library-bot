import { Collection, Guild, Message, MessageEditOptions, MessageEmbed, MessageOptions, TextChannel } from 'discord.js';
import { MClient } from '../client/MClient';
import { sleep } from '../utils';
import { ComboLibraryManager } from './ComboLibraryManager';

export enum LibraryStatuses {
    NOT_FOUND,
    UP_TO_DATE,
    OUT_OF_DATE,
    CHANNEL_NOT_SET,
    LENGTH_MISMATCH
}

export enum LibraryUpdateResponse {
    CHANNEL_NOT_SET,
    ALREADY_UP_TO_DATE,
    UPDATED
}

export enum LibraryPurgeResponse {
    NOT_FOUND,
    CHANNEL_NOT_SET,
    SUCCESS
}

export class GuildComboLibraryManager {
    private client: MClient;
    private clManager: ComboLibraryManager;
    private guild: Guild;

    constructor(client: MClient, clManager: ComboLibraryManager, guild: Guild) {
        this.client = client;
        this.clManager = clManager;
        this.guild = guild;
    }

    private async getLibraryChannel() {
        const guildSettings = await this.client.db.guilds.settings.get(this.guild.id);

        if (!guildSettings) {
            throw new Error('Guild settings not found.');
        }

        if (!guildSettings.sync_channel_id) {
            return undefined;
        }

        try {
            const channel = await this.guild.channels.fetch(guildSettings.sync_channel_id);
            if (!channel || channel.type !== 'GUILD_TEXT') throw new Error('Sync channel is not a text channel.');

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

    private async getLibraryStatus(messageCollection: Collection<String, Message>, mo: MessageOptions[]) {
        if (!messageCollection.size) return {
            status: LibraryStatuses.NOT_FOUND
        };

        // console.log(messageCollection);
        const messages = [...messageCollection.values()].reverse();
        const embeds = messages.map((m) => m.embeds[0]);

        // console.log(embeds);

        const rEmbeds = mo.map((e) => e.embeds![0] as MessageEmbed);

        if (embeds.length !== rEmbeds.length) {
            return { status: LibraryStatuses.LENGTH_MISMATCH };
        }

        const diff = this.compare(embeds, rEmbeds);

        if (!diff.length) return { status: LibraryStatuses.UP_TO_DATE };

        const diffCollection = new Collection<number, Message>();

        for (let i = 0; i < diff.length; i++) {
            const elementIndex = diff[i];
            diffCollection.set(elementIndex, messages[elementIndex]);
        }

        return {
            status: LibraryStatuses.OUT_OF_DATE,
            diff: diffCollection
        };
    }

    private compare(embeds1: MessageEmbed[], embeds2: MessageEmbed[]) {
        // Embed count is different
        if (embeds1.length !== embeds2.length) throw new Error('Embed arrays are of different length');

        const diff: number[] = [];

        for (let i = 0; i < embeds1.length; i++) {
            const embed1 = embeds1[i];
            const embed2 = embeds2[i];

            if (embed1.title !== embed2.title ||
                embed1.description !== embed2.description ||
                embed1.footer?.text !== embed2.footer?.text ||
                embed1.fields.length !== embed2.fields.length ||
                embed1.fields.some((f, i) => f.name !== embed2.fields[i].name || f.value !== embed2.fields[i].value)
            ) {
                diff.push(i);
            }
        }

        return diff;
    }

    public async update() {
        const channel = await this.getLibraryChannel();
        if (!channel) return LibraryUpdateResponse.CHANNEL_NOT_SET;
        const messageCollection = await this.getEmbedMessages(channel);

        const doc = await this.clManager.parseDoc();
        if (!doc) throw new Error('Cannot open document');
        const comboEmbeds = await this.clManager.toDiscordEmbeds(this.clManager.parseCombos(doc));

        // Send embeds if the channel is empty
        if (!messageCollection.size) {
            for (let i = 0; i < comboEmbeds.length; i++) {
                const embed = comboEmbeds[i];
                channel.send(embed);
                await sleep(1000);
            }

            return LibraryUpdateResponse.UPDATED;
        }
        const res = await this.getLibraryStatus(messageCollection, comboEmbeds);

        switch (res.status) {
            case LibraryStatuses.UP_TO_DATE:
                return LibraryUpdateResponse.ALREADY_UP_TO_DATE;

            case LibraryStatuses.OUT_OF_DATE:
                const { diff } = res;
                if (!diff) return LibraryUpdateResponse.ALREADY_UP_TO_DATE;

                const diffArr = Array.from(diff);

                for (let i = 0; i < diffArr.length; i++) {
                    const [comboIndex, message] = diffArr[i];

                    const edit = {
                        embeds: (comboEmbeds[comboIndex].embeds as MessageEmbed[]),
                        files: comboEmbeds[comboIndex].files,
                        attachments: []
                    } as MessageEditOptions;

                    message.edit(edit);
                    await sleep(1000);
                }

                return LibraryUpdateResponse.UPDATED;

            case LibraryStatuses.LENGTH_MISMATCH:
                for (const m of messageCollection.values()) {
                    await m.delete();
                    await sleep(1000);
                }

                for (let i = 0; i < comboEmbeds.length; i++) {
                    const embed = comboEmbeds[i];
                    channel.send(embed);
                    await sleep(1000);
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

        const doc = await this.clManager.parseDoc();
        if (!doc) throw new Error('Cannot open document');
        const comboEmbeds = await this.clManager.toDiscordEmbeds(this.clManager.parseCombos(doc));

        const res = await this.getLibraryStatus(messageCollection, comboEmbeds);

        return res.status;
    }

    public async purge(
        deleteCallback?: (i?: number, messages?: Message[]) => unknown | Promise<unknown>
    ) {
        const channel = await this.getLibraryChannel();
        if (!channel) return LibraryPurgeResponse.CHANNEL_NOT_SET;
        const messageCollection = await this.getEmbedMessages(channel);

        if (!messageCollection.size) return LibraryPurgeResponse.NOT_FOUND;

        const messages = [...messageCollection.values()];

        for (let i = 0; i < messages.length; i++) {
            const m = messages[i];

            await m.delete();

            if (i < messages.length - 1)
                await sleep(1000);

            !!deleteCallback && await deleteCallback(i, messages);
        }

        return LibraryPurgeResponse.SUCCESS;
    }
}