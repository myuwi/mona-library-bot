import { APIEmbedField, AttachmentBuilder, EmbedBuilder } from "discord.js";
import { Character, Element } from "../../GenshinData";
import { colors } from "../../colors";
import { team } from "../../imageGenerator";
import { DocElement } from "../DocumentParser";
import { ComboLibraryElement } from "./ComboLibraryElement";

export type ComboField = {
  name: string;
  value: DocElement[];
};

export type ComboData = {
  name: string;
  submittedBy?: string;
  description: DocElement[];
  members: (Character | Element)[];
  headingId?: string;
  fields: ComboField[];
};

const ZERO_WIDTH_SPACE = String.fromCharCode(8203);

export class Combo extends ComboLibraryElement<ComboData> {
  protected createEmbed(combo: ComboData) {
    const embed = new EmbedBuilder()
      .setTitle(combo.name)
      .setColor(colors.primary);

    if (combo.submittedBy) {
      embed.setFooter({
        text: `Submitted by ${combo.submittedBy}`,
      });
    }

    const desc: string[] = [];
    for (const el of combo.description) {
      // combo desc
      if (el.style === "NORMAL_TEXT") {
        desc.push(el.toMarkdown());
        continue;
      }

      break;
    }

    desc.push(ZERO_WIDTH_SPACE);
    embed.setDescription(desc.join("\n"));

    const embedFields: APIEmbedField[] = [];

    // Iterate over fields
    for (const field of combo.fields) {
      const allowedFields = [
        "Description",
        "Difficulty",
        "Combo Steps",
        "Video",
        "Videos",
      ];
      if (!allowedFields.includes(field.name)) continue;

      const lines = field.value.reduce((acc: string[], cur) => {
        const line = cur.toMarkdown();

        return [...acc, line];
      }, []);

      lines.push(ZERO_WIDTH_SPACE);

      const embedField = {
        name: field.name,
        value: lines.join("\n"),
      };

      embedFields.push(embedField);
    }

    const headerLink =
      combo.headingId &&
      `[View on Google Docs](https://docs.google.com/document/d/1DafFm_vfrur0fgNWeEmhEGhcJeyNOg3ccaupzBv0zjo/edit#heading=${combo.headingId})`;

    // add link to the end of the last field
    if (headerLink) {
      embedFields[embedFields.length - 1]!.value += `\n${headerLink}`;
    }

    // console.log('embedFields', embedFields);
    embed.addFields(embedFields);

    if (combo.members.length) {
      // console.log(combo.members);

      const imageName = combo.members
        .map((m) => {
          // TypeScript type checking is being dumb here
          const name =
            "displayName" in m && m.displayName ? m.displayName : m.name;
          return name.toLowerCase().replace(" ", "");
        })
        .join("-");

      embed.setImage(`attachment://${imageName}.png`);
    }

    return embed;
  }

  public async generateTeamImage() {
    const combo = this.data;

    if (!combo || !combo.members.length) return null;
    // console.log(combo.members);

    const image = await team(combo.members, {
      background: true,
    });

    return image;
  }

  public override async getAttachments() {
    const combo = this.data;
    const image = await this.generateTeamImage();
    if (!combo || !combo.members.length || !image) return [];

    const imageName = combo.members
      .map((m) => {
        const name =
          "displayName" in m && m.displayName ? m.displayName : m.name;
        return name.toLowerCase().replace(" ", "");
      })
      .join("-");

    return [new AttachmentBuilder(image, { name: `${imageName}.png` })];
  }
}
