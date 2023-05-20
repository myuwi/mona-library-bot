import { PermissionFlagsBits } from "discord.js";
import { defineCommand } from "../../lib/commands";
import {
  LibraryStatuses,
  LibraryUpdateResponse,
  getLibraryStatus,
  updateDirectory,
  updateLibrary,
} from "../../structures/ComboLibraryManager";
import * as EmbedUtils from "../../structures/EmbedUtils";

export default defineCommand({
  name: "update",
  description: "Update the combo library",
  permissions: PermissionFlagsBits.ManageMessages,
  async run(client, interaction) {
    await interaction.deferReply();

    const statusId = await getLibraryStatus(client, interaction.guild!);

    if (statusId === LibraryStatuses.CHANNEL_NOT_SET) {
      return await interaction.editReply({
        embeds: [
          EmbedUtils.error(
            "The combo library channel has not been set on this server"
          ),
        ],
      });
    }

    try {
      await interaction.editReply({
        embeds: [EmbedUtils.info("Updating library channel...")],
      });

      const status = await updateLibrary(client, interaction.guild!);

      if (status === LibraryUpdateResponse.UPDATED) {
        try {
          await interaction.editReply({
            embeds: [EmbedUtils.info("Updating directory channel...")],
          });
          await updateDirectory(client, interaction.guild!);
        } catch (err: any) {
          if (err.message !== "Library channel not set") {
            console.error(err.toString());
            await interaction.editReply({
              embeds: [
                EmbedUtils.error(
                  "Unable to update directory channel: " + err.message
                ),
              ],
            });
          }
        }
      }

      const messages = {
        [LibraryUpdateResponse.CHANNEL_NOT_SET]: EmbedUtils.error(
          "The combo library channel has not been set on this server"
        ),
        [LibraryUpdateResponse.ALREADY_UP_TO_DATE]: EmbedUtils.success(
          "The combo library is already up to date, no update was performed"
        ),
        [LibraryUpdateResponse.UPDATED]: EmbedUtils.success(
          "The combo library channel has been updated succeessfully"
        ),
      };

      if (messages[status]) {
        await interaction.editReply({ embeds: [messages[status]] });
      }
    } catch (err: any) {
      console.error(err.toString());

      await interaction.editReply({
        embeds: [
          EmbedUtils.error(
            "Something went wrong with the library update, see error log for more information"
          ),
        ],
      });
    }
  },
});
