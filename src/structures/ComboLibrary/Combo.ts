import { EmbedFieldData, MessageAttachment, MessageEmbed } from 'discord.js';
import { DocElement } from '../DocumentParser';
import { Character } from '../../GenshinData';
import { ComboLibraryElement } from './ComboLibraryElement';
import { ThumbnailGenerator } from '../../ThumbnailGenerator';
import { colors } from '../../colors';

export type ComboField = {
    name: string;
    value: DocElement[];
};

export type ComboData = {
    name: string;
    submittedBy?: string;
    description: DocElement[];
    members: Character[];
    headingId?: string;
    fields: ComboField[];
};

const ZERO_WIDTH_SPACE = String.fromCharCode(8203);

export class Combo extends ComboLibraryElement<ComboData> {
    protected createEmbed(combo: ComboData) {
        const embed = new MessageEmbed({
            title: combo.name,
            color: colors.primary,
        });

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
        }

        const headerLink =
            combo.headingId &&
            `[View on Google Docs](https://docs.google.com/document/d/1DafFm_vfrur0fgNWeEmhEGhcJeyNOg3ccaupzBv0zjo/edit#heading=${combo.headingId})`;

        // add link to the end of the last field
        if (headerLink) {
            embedFields[embedFields.length - 1].value += `\n${headerLink}`;
        }

        // console.log('embedFields', embedFields);
        embed.addFields(embedFields);

        if (combo.members.length) {
            // console.log(combo.members);

            const imageName = combo.members
                .map((m) => {
                    const name = m.displayName ?? m.name;
                    return name.toLowerCase().replace(' ', '');
                })
                .join('-');

            embed.setImage(`attachment://${imageName}.png`);
        }

        return embed;
    }

    public async generateTeamImage() {
        const combo = this.data;

        if (!combo || !combo.members.length) return null;
        // console.log(combo.members);

        const image = await ThumbnailGenerator.team(combo.members, { background: true });

        return image;
    }

    public async getAttachments() {
        const combo = this.data;
        const image = await this.generateTeamImage();
        if (!combo || !combo.members.length || !image) return [];

        const imageName = combo.members
            .map((m) => {
                const name = m.displayName ?? m.name;
                return name.toLowerCase().replace(' ', '');
            })
            .join('-');

        return [new MessageAttachment(image, `${imageName}.png`)];
    }
}
