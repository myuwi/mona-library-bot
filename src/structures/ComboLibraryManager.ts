import { DocParser, DocElement } from './DocParser';
import axios from 'axios';
import { EmbedFieldData, Guild, MessageAttachment, MessageEditOptions, MessageEmbed, MessageOptions, NewsChannel, TextChannel, ThreadChannel } from 'discord.js';
import { GenshinData } from '../GenshinData';
import { ThumbnailGenerator } from './ThumbnailGenerator';
import { MClient } from '../client/MClient';
import { sleep } from '../utils';
import { GuildComboLibraryManager } from './GuildComboLibraryManager';

export type ComboLibrary = {
    categories: ComboCategory[];
};

export type ComboCategory = {
    name: string;
    description: DocElement[];
    headingId?: string;
    combos: Combo[];
};

export type Combo = {
    name: string;
    submittedBy?: string;
    description: DocElement[];
    members: string[];
    headingId?: string;
    fields: ComboField[];
};

export type ComboField = {
    name: string;
    value: DocElement[];
};

export enum LibraryStatuses {
    NOT_SYNCED,
    UP_TO_DATE,
    OUT_OF_DATE,
}

export enum LibraryUpdateMessages {
    ALREADY_UP_TO_DATE,
    UPDATED
}

const ZERO_WIDTH_SPACE = String.fromCharCode(8203);

export class ComboLibraryManager extends DocParser {
    private client: MClient;

    constructor(client: MClient) {
        super();
        this.client = client;
    }

    public async get(guild: Guild | string) {
        try {
            if (guild instanceof Guild) {
                return new GuildComboLibraryManager(this.client, this, guild);
            }

            if (typeof guild !== 'string') throw new Error('Invalid guild type');

            const g = await this.client.guilds.fetch(guild);

            if (!g) throw new Error('Guild not found');

            return new GuildComboLibraryManager(this.client, this, g);
        } catch (err) {
            return undefined;
        }
    }

    public static parseCombos(
        elements: DocElement[],
        options = {
            sanitizeNewLines: true
        }
    ) {
        const comboLibrary: ComboLibrary = {
            categories: []
        };

        let combosStarted = false;

        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];

            if (!combosStarted && element.style === 'HEADING_1' && element.rawText === 'Vaporize Combos') {
                combosStarted = true;
            }

            if (!combosStarted) continue;

            if (element.style === 'HEADING_1' && element.rawText.toLowerCase() === 'how to submit a combo') {
                break;
            }

            // category title
            if (element.style === 'HEADING_1' && element.rawText !== '') {

                const comboCategory: ComboCategory = {
                    name: element.rawText,
                    description: [],
                    combos: []
                };

                if (element.headingId) {
                    comboCategory.headingId = element.headingId;
                }

                const desc = [];
                for (let j = i + 1; j < elements.length; j++) {
                    const el = elements[j];

                    // category desc
                    if (el.style === 'NORMAL_TEXT') {
                        desc.push(el);
                        continue;
                    }

                    break;
                }

                if (options.sanitizeNewLines) {
                    // remove empty lines from the start
                    while (desc[0].rawText === '') {
                        desc.shift();
                    }

                    // remove empty lines from the end
                    while (desc[desc.length - 1].rawText === '') {
                        desc.pop();
                    }
                }

                comboCategory.description = desc;

                comboLibrary.categories.push(comboCategory);
                continue;
            }

            // Combo
            if (element.style === 'HEADING_2' && element.rawText !== '') {
                const combo: Combo = {
                    name: element.rawText,
                    description: [],
                    members: [],
                    fields: []
                };

                // Heading Id
                if (element.headingId) {
                    combo.headingId = element.headingId;
                }

                // Combo Description
                const desc: DocElement[] = [];
                for (let j = i + 1; j < elements.length; j++) {
                    const el = elements[j];

                    // combo desc
                    if (el.style === 'NORMAL_TEXT') {
                        const descLineText = el.rawText;
                        // parse submitter
                        if (descLineText.startsWith('Submitted by')) {
                            combo.submittedBy = descLineText.replace('Submitted by ', '');
                            continue;
                        }

                        desc.push(el);
                        continue;
                    }

                    // Break loop when elements are no longer of style 'Normal text'
                    break;
                }

                // Remove empty lines from the start and the end of the description
                if (options.sanitizeNewLines) {
                    while (desc[0].rawText === '') {
                        desc.shift();
                    }

                    while (desc[desc.length - 1].rawText === '') {
                        desc.pop();
                    }
                }

                combo.description = desc;

                // iterate over elements
                for (let j = i + 1; j < elements.length; j++) {
                    const el = elements[j];

                    // section header
                    if (el.style === 'HEADING_3') {
                        const elText = el.rawText;
                        if (elText === '') continue;

                        const field: ComboField = {
                            name: elText,
                            value: []
                        };

                        // section content
                        for (let k = j + 1; k < elements.length; k++) {
                            const el = elements[k];

                            // field value
                            if (el.style === 'NORMAL_TEXT') {
                                field.value.push(el);
                                continue;
                            }

                            break;
                        }

                        // Parse combo members
                        if (field.name === 'Combo Requirements') {
                            for (let j = 0; j < field.value.length; j++) {
                                const line = field.value[j];

                                for (let k = 0; k < GenshinData.length; k++) {
                                    const characterName = GenshinData[k].name;

                                    if (line.rawText.toUpperCase().startsWith(characterName.toUpperCase())) {
                                        combo.members.push(characterName);
                                        break;
                                    }
                                }
                            }
                        }

                        combo.fields.push(field);
                    }

                    if (el.style !== 'HEADING_3' && el.style !== 'NORMAL_TEXT') break;
                }

                // console.log('fields', fields);

                comboLibrary.categories[comboLibrary.categories.length - 1].combos.push(combo);
                continue;
            }
        }

        return comboLibrary;
    }

    public static async toDiscordEmbeds(comboLibrary: ComboLibrary) {
        const assets: { [s: string]: string; } = {
            'Vaporize Combos': 'https://cdn.discordapp.com/attachments/809845587905871914/875084375333687296/Namecard_Background_Mona_Starry_Sky_188px.png',
            'Freeze Combos': 'https://cdn.discordapp.com/attachments/809845587905871914/878954338788180038/Namecard_Background_Ganyu_Qilin_188px.png',
            'Electro-Charged Combos': 'https://cdn.discordapp.com/attachments/809845587905871914/878954346098872330/Namecard_Background_Beidou_Weighing_Anchor_188px.png'
        };

        const embeds: MessageOptions[] = [];

        // combo categories
        for (let i = 0; i < comboLibrary.categories.length; i++) {
            const category = comboLibrary.categories[i];

            if (!category.combos.length) continue;

            const embed = new MessageEmbed()
                .setTitle(category.name)
                .setColor('#5565f1');

            if (assets[category.name]) {
                embed.setImage(assets[category.name]);
            }

            const desc = [];
            for (let j = 0; j < category.description.length; j++) {
                const el = category.description[j];

                // category desc
                if (el.style === 'NORMAL_TEXT') {
                    desc.push(el.toMarkdown());
                    continue;
                }

                break;
            }

            if (category.headingId) {
                desc.push(`${ZERO_WIDTH_SPACE}\n[View on Google Docs](https://docs.google.com/document/d/1DafFm_vfrur0fgNWeEmhEGhcJeyNOg3ccaupzBv0zjo/edit#heading=${category.headingId})`);
            }

            embed.setDescription(desc.join('\n'));

            embeds.push({ embeds: [embed] });

            // combos
            for (let j = 0; j < category.combos.length; j++) {
                const combo = category.combos[j];
                // console.log(combo);

                const embed = new MessageEmbed()
                    .setTitle(combo.name)
                    .setColor('#5565f1');

                if (combo.submittedBy) {
                    embed.setFooter(`Submitted by ${combo.submittedBy}`);
                }

                const desc: string[] = [];
                for (let k = 0; k < combo.description.length; k++) {
                    const el = combo.description[k];

                    // combo desc
                    if (el.style === 'NORMAL_TEXT') {
                        desc.push(el.toMarkdown());
                        continue;
                    }

                    break;
                }

                desc.push(ZERO_WIDTH_SPACE);
                embed.setDescription(desc.join('\n'));

                const embedFields: EmbedFieldData[] = [];

                // Iterate over fields
                for (let k = 0; k < combo.fields.length; k++) {
                    const field = combo.fields[k];

                    const allowedFields = ['Description', 'Difficulty', 'Combo Steps', 'Video', 'Videos'];
                    if (!allowedFields.includes(field.name)) continue;

                    const lines = field.value.reduce((acc: string[], cur) => {
                        const line = cur.toMarkdown();
                        return [...acc, line];
                    }, []);

                    lines.push(ZERO_WIDTH_SPACE);

                    const embedField: EmbedFieldData = {
                        name: field.name,
                        value: lines.join('\n')
                    };

                    embedFields.push(embedField);

                    // if (options.thumbnails && !embed.image && (field.name === 'Video' || field.name === 'Videos')) {
                    //     for (let l = 0; l < field.value.length; l++) {
                    //         const textEl = field.value[l];
                    //         const thumbnail = await DocParser.getVideoThumbnail(textEl);

                    //         if (thumbnail) {
                    //             embed.setImage(thumbnail);
                    //             break;
                    //         }
                    //     }
                    // }
                }

                const headerLink = combo.headingId && `[View on Google Docs](https://docs.google.com/document/d/1DafFm_vfrur0fgNWeEmhEGhcJeyNOg3ccaupzBv0zjo/edit#heading=${combo.headingId})`;

                // add link to the end of the last field
                if (headerLink) {
                    embedFields[embedFields.length - 1].value += `\n${headerLink}`;
                }

                // console.log('embedFields', embedFields);
                embed.addFields(embedFields);

                const messageOptions: MessageOptions = {
                    embeds: [embed]
                };

                if (combo.members.length) {
                    const image = await ThumbnailGenerator.abyss(combo.members);
                    if (image) {
                        messageOptions.files = [new MessageAttachment(image, 'team.png')];
                        embed.setImage('attachment://team.png');
                    }
                }

                embeds.push(messageOptions);
            }
        }

        return embeds;
    }

    public static async toDiscordDirectory(comboLibrary: ComboLibrary) {
        const embed = new MessageEmbed()
            .setTitle('Mona Combo Library')
            .setColor('#5565f1')
            .setImage('https://cdn.discordapp.com/attachments/809845587905871914/875084375333687296/Namecard_Background_Mona_Starry_Sky_188px.png')
            .setFooter('Please DM Myuwi#0001 if there\'s any trouble with the bot.');

        // combo categories
        for (let i = 0; i < comboLibrary.categories.length; i++) {
            const category = comboLibrary.categories[i];

            const field: EmbedFieldData = {
                name: category.name,
                value: ''
            };

            const comboLinks = [];

            // combos
            for (let j = 0; j < category.combos.length; j++) {
                const combo = category.combos[j];
                // console.log(combo);

                if (combo.headingId) {
                    comboLinks.push(`‣ [${combo.name}](https://docs.google.com/document/d/1DafFm_vfrur0fgNWeEmhEGhcJeyNOg3ccaupzBv0zjo/edit#heading=${combo.headingId})`);
                }
            }

            if (comboLinks.length) {
                field.value = comboLinks.join('\n');
                embed.addFields(field);
            }
        }

        return embed;
    }

    public static compare(embeds1: MessageEmbed[], embeds2: MessageEmbed[]) {
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

    private static async getLibraryChannelEmbeds(client: MClient, channel: TextChannel | NewsChannel | ThreadChannel) {
        if (!channel) throw new Error('Channel with specified id not found');
        if (!channel.isText() || !('guild' in channel)) throw new Error('Channel with specified id is not a text channel');

        const messageCollection = await channel.messages.fetch();
        messageCollection.sweep((m) => {
            if (m.author.id !== client.user!.id) return true;
            if (!m.embeds.length) return true;

            const embedDesc = m.embeds[0].description;
            if (!!embedDesc && embedDesc.includes('View on Google Docs')) return false;

            const lastFieldValue = m.embeds[0].fields[m.embeds[0].fields.length - 1]?.value;
            if (!!lastFieldValue && lastFieldValue.includes('View on Google Docs')) return false;

            return true;
        });

        return messageCollection;
    }

    public static async getLibraryStatus(client: MClient, channel: TextChannel | NewsChannel | ThreadChannel) {
        const messageCollection = await ComboLibraryManager.getLibraryChannelEmbeds(client, channel);

        if (!messageCollection.size) return { status: LibraryStatuses.NOT_SYNCED };

        // console.log(messageCollection);
        const messages = [...messageCollection.values()].reverse();
        const embeds = messages.map((m) => m.embeds[0]);

        // console.log(embeds);

        const doc = await client.comboLib.parseDoc();
        if (!doc) throw new Error('Cannot open document');
        const mo = await ComboLibraryManager.toDiscordEmbeds(ComboLibraryManager.parseCombos(doc));
        const rEmbeds = mo.map((e) => e.embeds![0] as MessageEmbed);

        const diff = ComboLibraryManager.compare(embeds, rEmbeds);

        if (!diff || !diff.length) return { status: LibraryStatuses.UP_TO_DATE };

        return {
            status: LibraryStatuses.OUT_OF_DATE,
            data: diff
        };
    }

    public static async purgeLibrary(client: MClient, channel: TextChannel | NewsChannel | ThreadChannel) {
        const messageCollection = await ComboLibraryManager.getLibraryChannelEmbeds(client, channel);

        if (!messageCollection.size) throw new Error('No library found');

        for (const m of messageCollection.values()) {
            await m.delete();
            await sleep(1000);
        }
    }

    public static async updateLibrary(client: MClient, channel: TextChannel | NewsChannel | ThreadChannel) {
        const messageCollection = await ComboLibraryManager.getLibraryChannelEmbeds(client, channel);

        if (!messageCollection.size) {
            const doc = await client.comboLib.parseDoc();
            if (!doc) throw new Error('Cannot open document');
            const mo = await ComboLibraryManager.toDiscordEmbeds(ComboLibraryManager.parseCombos(doc));

            for (let i = 0; i < mo.length; i++) {
                const embed = mo[i];
                channel.send(embed);
                await sleep(1000);
            }
            return { message: LibraryUpdateMessages.UPDATED };
        }

        // console.log(messageCollection);
        const messages = [...messageCollection.values()].reverse();
        const embeds = messages.map((m) => m.embeds[0]);

        // console.log(embeds);

        const doc = await client.comboLib.parseDoc();
        if (!doc) throw new Error('Cannot open document');
        const mo = await ComboLibraryManager.toDiscordEmbeds(ComboLibraryManager.parseCombos(doc));
        const rEmbeds = mo.map((e) => e.embeds![0] as MessageEmbed);

        if (embeds.length !== rEmbeds.length) {
            for (const m of messageCollection.values()) {
                await m.delete();
                await sleep(1000);
            }

            for (let i = 0; i < mo.length; i++) {
                const embed = mo[i];
                channel.send(embed);
                await sleep(1000);
            }
            return { message: LibraryUpdateMessages.UPDATED };
        }

        const diff = ComboLibraryManager.compare(embeds, rEmbeds);



        if (!diff.length) return { message: LibraryUpdateMessages.ALREADY_UP_TO_DATE };


        for (let i = 0; i < diff.length; i++) {
            const edit = {
                embeds: (mo[diff[i]].embeds as MessageEmbed[]),
                files: mo[diff[i]].files,
                attachments: []
            } as MessageEditOptions;

            messages[diff[i]].edit(edit);
            await sleep(1000);
        }

        return { message: LibraryUpdateMessages.UPDATED };
    }

    private static async getVideoThumbnail(docElement: DocElement) {
        // console.log(docElement);
        const elements = docElement.elements;

        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            if (element.link) {
                if (element.link.includes('streamable')) {
                    const parsed = element.link.match(/https:\/\/streamable\.com\/(\w+)/);
                    if (parsed && parsed[1]) {
                        const id = parsed[1];
                        // console.log(id);

                        try {
                            const res = await axios.get(`https://api.streamable.com/videos/${id}`);

                            const thumbnail_url = res.data.thumbnail_url;
                            if (thumbnail_url) return `https:${thumbnail_url}`;
                        } catch (err) {
                            console.log(err);
                        }
                    }
                }

                if (element.link.includes('youtu')) {
                    const parsed = element.link.match(/(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)&?/);
                    if (parsed && parsed[1]) {
                        const id = parsed[1];
                        // console.log(id);

                        try {
                            const res = await axios.get(`https://www.youtube.com/oembed?url=https://youtu.be/${id}&format=json`);

                            const thumbnail_url = res.data.thumbnail_url;
                            if (thumbnail_url) return thumbnail_url.replace('hqdefault', 'maxresdefault');
                        } catch (err) {
                            console.log(err);
                        }
                    }
                }
            }
        }

        return undefined;
    }
}