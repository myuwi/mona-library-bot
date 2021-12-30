import { MessageEmbed } from 'discord.js';
import { DocElement } from '../DocumentParser';
import { ComboLibraryElement } from './ComboLibraryElement';
import { Combo } from './Combo';
import { colors } from '../../colors';

export type ComboCategoryData = {
    name: string;
    description: DocElement[];
    headingId?: string;
    combos: Combo[];
};

const ZERO_WIDTH_SPACE = String.fromCharCode(8203);

const assets: { [s: string]: string } = {
    'Vaporize Combos':
        'https://cdn.discordapp.com/attachments/809845587905871914/875084375333687296/Namecard_Background_Mona_Starry_Sky_188px.png',
    'Freeze Combos':
        'https://cdn.discordapp.com/attachments/809845587905871914/878954338788180038/Namecard_Background_Ganyu_Qilin_188px.png',
    'Electro-Charged Combos':
        'https://cdn.discordapp.com/attachments/809845587905871914/878954346098872330/Namecard_Background_Beidou_Weighing_Anchor_188px.png',
};

export class ComboCategory extends ComboLibraryElement<ComboCategoryData> {
    protected createEmbed(category: ComboCategoryData) {
        // if (!category.combos.length) return;

        const embed = new MessageEmbed({
            title: category.name,
            color: colors.primary,
        });

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
                `${ZERO_WIDTH_SPACE}\n[View on Google Docs](https://docs.google.com/document/d/1DafFm_vfrur0fgNWeEmhEGhcJeyNOg3ccaupzBv0zjo/edit#heading=${category.headingId})`
            );
        }

        embed.setDescription(desc.join('\n'));

        return embed;
    }
}
