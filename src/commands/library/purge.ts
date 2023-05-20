import { PermissionFlagsBits } from "discord.js";
import { defineCommand } from "../../lib/commands";
import {
  LibraryPurgeResponse,
  LibraryStatuses,
  getLibraryStatus,
  purgeLibrary,
} from "../../structures/ComboLibraryManager";
import * as EmbedUtils from "../../structures/EmbedUtils";

export default defineCommand({
  name: "purge",
  description: "Purge the combo library",
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

    await interaction.editReply({
      embeds: [EmbedUtils.info("Purging the combo library, please wait...")],
    });

    const resId = await purgeLibrary(client, interaction.guild!);

    const messages = {
      [LibraryPurgeResponse.SUCCESS]: EmbedUtils.success(
        "The combo library has been purged successfully"
      ),
      [LibraryPurgeResponse.CHANNEL_NOT_SET]: EmbedUtils.error(
        "The combo library channel has not been set on this server"
      ),
      [LibraryPurgeResponse.EMPTY]: EmbedUtils.error(
        "Unable to purge the combo library channel, the channel is already empty"
      ),
    };

    if (messages[resId]) {
      await interaction.editReply({ embeds: [messages[resId]] });
    }
  },
});
