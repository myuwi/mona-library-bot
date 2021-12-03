import { DocParser, DocElement } from './DocParser';
import { EmbedFieldData, Guild, MessageAttachment, MessageEmbed, MessageOptions } from 'discord.js';
import { Characters, parseCharacters } from '../GenshinData';
import { ThumbnailGenerator } from '../ThumbnailGenerator';
import { MClient } from '../client/MClient';
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

const ZERO_WIDTH_SPACE = String.fromCharCode(8203);

export class ComboLibraryManager extends DocParser {
    private client: MClient;

    constructor(client: MClient, documentId: string) {
        super(documentId);
        this.client = client;
    }

    public async fetch(guild: Guild | string) {
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

    public parseCombos(elements: DocElement[]) {
        const comboLibrary: ComboLibrary = {
            categories: [],
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
                    combos: [],
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

                // remove empty lines from the start
                while (desc[0].rawText === '') {
                    desc.shift();
                }

                // remove empty lines from the end
                while (desc[desc.length - 1].rawText === '') {
                    desc.pop();
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
                    fields: [],
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
                while (desc[0].rawText === '') {
                    desc.shift();
                }

                while (desc[desc.length - 1].rawText === '') {
                    desc.pop();
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
                            value: [],
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

                                for (let k = 0; k < Characters.length; k++) {
                                    const characterName = Characters[k].name;

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

    public async toDiscordEmbeds(comboLibrary: ComboLibrary) {
        const assets: { [s: string]: string } = {
            'Vaporize Combos':
                'https://cdn.discordapp.com/attachments/809845587905871914/875084375333687296/Namecard_Background_Mona_Starry_Sky_188px.png',
            'Freeze Combos':
                'https://cdn.discordapp.com/attachments/809845587905871914/878954338788180038/Namecard_Background_Ganyu_Qilin_188px.png',
            'Electro-Charged Combos':
                'https://cdn.discordapp.com/attachments/809845587905871914/878954346098872330/Namecard_Background_Beidou_Weighing_Anchor_188px.png',
        };

        const embeds: MessageOptions[] = [];

        // combo categories
        for (let i = 0; i < comboLibrary.categories.length; i++) {
            const category = comboLibrary.categories[i];

            if (!category.combos.length) continue;

            const embed = new MessageEmbed().setTitle(category.name).setColor('#5565f1');

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
                desc.push(
                    `${ZERO_WIDTH_SPACE}\n[View on Google Docs](https://docs.google.com/document/d/${this.documentId}/edit#heading=${category.headingId})`
                );
            }

            embed.setDescription(desc.join('\n'));

            embeds.push({ embeds: [embed] });

            // combos
            for (let j = 0; j < category.combos.length; j++) {
                const combo = category.combos[j];
                // console.log(combo);

                const embed = new MessageEmbed().setTitle(combo.name).setColor('#5565f1');

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
                        value: lines.join('\n'),
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

                const headerLink =
                    combo.headingId &&
                    `[View on Google Docs](https://docs.google.com/document/d/${this.documentId}/edit#heading=${combo.headingId})`;

                // add link to the end of the last field
                if (headerLink) {
                    embedFields[embedFields.length - 1].value += `\n${headerLink}`;
                }

                // console.log('embedFields', embedFields);
                embed.addFields(embedFields);

                const messageOptions: MessageOptions = {
                    embeds: [embed],
                };

                if (combo.members.length) {
                    const members = parseCharacters(combo.members);
                    const image = await ThumbnailGenerator.abyss(members);

                    const imageName = combo.members.map((m) => m.toLowerCase().replace(' ', '')).join('-');

                    if (image) {
                        messageOptions.files = [new MessageAttachment(image, `${imageName}.png`)];
                        embed.setImage(`attachment://${imageName}.png`);
                    }
                }

                embeds.push(messageOptions);
            }
        }

        return embeds;
    }

    public async toDiscordDirectory(comboLibrary: ComboLibrary) {
        const embed = new MessageEmbed()
            .setTitle('Mona Combo Library')
            .setColor('#5565f1')
            .setImage(
                'https://cdn.discordapp.com/attachments/809845587905871914/875084375333687296/Namecard_Background_Mona_Starry_Sky_188px.png'
            )
            .setFooter("Please DM Myuwi#0001 if there's any trouble with the bot.");

        // combo categories
        for (let i = 0; i < comboLibrary.categories.length; i++) {
            const category = comboLibrary.categories[i];

            const field: EmbedFieldData = {
                name: category.name,
                value: '',
            };

            const comboLinks = [];

            // combos
            for (let j = 0; j < category.combos.length; j++) {
                const combo = category.combos[j];
                // console.log(combo);

                if (combo.headingId) {
                    comboLinks.push(
                        `‣ [${combo.name}](https://docs.google.com/document/d/${this.documentId}/edit#heading=${combo.headingId})`
                    );
                }
            }

            if (comboLinks.length) {
                field.value = comboLinks.join('\n');
                embed.addFields(field);
            }
        }

        return embed;
    }
}
