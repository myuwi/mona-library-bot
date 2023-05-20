import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { colors } from "../../colors";
import { config } from "../../config";
import { defineCommand } from "../../lib/commands";
import {
  LibraryStatuses,
  getLibraryStatus,
} from "../../structures/ComboLibraryManager";

export default defineCommand({
  name: "status",
  description: "Get the status of the combo library",
  permissions: PermissionFlagsBits.ManageMessages,
  async run(client, interaction) {
    await interaction.deferReply();

    const statusId = await getLibraryStatus(client, interaction.guild!);

    let status: string;
    switch (statusId) {
      case LibraryStatuses.NOT_FOUND:
        status = "Not synced";
        break;
      case LibraryStatuses.LENGTH_MISMATCH:
      case LibraryStatuses.OUT_OF_DATE:
        status = "Out of Date";
        break;
      case LibraryStatuses.UP_TO_DATE:
        status = "Up to date";
        break;
      case LibraryStatuses.CHANNEL_NOT_SET:
        status = "Channel not set";
        break;
      default:
        status = "Unknown";
    }

    const guildSettings = config[interaction.guildId!];

    const embed = new EmbedBuilder()
      .setTitle("Combo Library Status")
      .setColor(colors.primary)
      .setImage(
        "https://cdn.discordapp.com/attachments/809845587905871914/875084375333687296/Namecard_Background_Mona_Starry_Sky_188px.png"
      )
      .setFooter({ text: client.user!.username })
      .setTimestamp(Date.now())
      .addFields(
        { name: "Status", value: status },
        {
          name: "Library Channel",
          value: guildSettings?.libraryChannelId
            ? `<#${guildSettings.libraryChannelId}>`
            : "Unset",
          inline: true,
        },
        {
          name: "Directory Channel",
          value: guildSettings?.directoryChannelId
            ? `<#${guildSettings.directoryChannelId}>`
            : "Unset",
          inline: true,
        }
      );

    await interaction.editReply({
      embeds: [embed],
    });
  },
});
