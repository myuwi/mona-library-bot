import {
  ApplicationCommandOptionType,
  AttachmentBuilder,
  EmbedBuilder,
  MessageEditOptions,
  PermissionFlagsBits,
} from "discord.js";
import { Character, Characters, Elements, parseTeam } from "../../GenshinData";
import { colors } from "../../colors";
import { defineCommand } from "../../lib/commands";
import * as EmbedUtils from "../../structures/EmbedUtils";
import { team } from "../../imageGenerator";

export default defineCommand({
  name: "team",
  description: "Generate a team image",
  options: [
    {
      name: "members",
      description: "A comma (,) separated list of character names",
      type: ApplicationCommandOptionType.String,
    },
  ],
  permissions: PermissionFlagsBits.ManageMessages,
  async run(_, interaction) {
    const members = interaction.options.getString("members");

    if (!members) {
      const elements = Object.values(Elements)
        .map((e) => `\`${e.name}\``)
        .join(", ");

      const chars = Characters.map((c: Character) => {
        let aliases = [];
        if (c.displayName) aliases.push(c.displayName);
        if (c.aliases && c.aliases.length) aliases = [...aliases, ...c.aliases];

        let str = c.name;
        if (aliases.length) str += ` (${aliases.join(", ")})`;

        return `\`${str}\``;
      }).join(", ");

      return await interaction.reply({
        content: `**Available elements:**\n${elements}\n\n**Available characters:**\n${chars}`,
        ephemeral: true,
      });
    }

    await interaction.deferReply();

    const teamRaw = members
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);

    let chars;
    try {
      chars = parseTeam(teamRaw);
    } catch (err: any) {
      if (err.message.startsWith("Unable to parse characters:")) {
        await interaction.editReply({
          embeds: [EmbedUtils.error(err.message)],
        });
      }
      return;
    }

    if (!chars.length) {
      return await interaction.editReply({
        embeds: [
          EmbedUtils.error(
            "Invalid team! Team must have atleast one valid team member."
          ),
        ],
      });
    }

    const image = await team(chars);

    if (!image) {
      return await interaction.editReply({
        embeds: [EmbedUtils.error("Invalid team")],
      });
    }

    const imageName = chars
      .map((m) => {
        const name = ("displayName" in m && m.displayName) || m.name;
        return name.toLowerCase().replace(" ", "");
      })
      .join("-");

    const embed = new EmbedBuilder()
      .setTitle(chars.map((c) => c.name).join(", "))
      .setColor(colors.primary)
      .setImage(`attachment://${imageName}.png`);

    const messageOptions: MessageEditOptions = {
      embeds: [embed],
      files: [new AttachmentBuilder(image, { name: `${imageName}.png` })],
    };

    await interaction.editReply(messageOptions);
  },
});
