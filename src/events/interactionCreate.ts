import { Events } from "discord.js";
import { defineEvent } from "../lib/events";

export default defineEvent({
  name: Events.InteractionCreate,
  async run(client, interaction) {
    if (!interaction.isChatInputCommand() || !interaction.guild) return;

    const cmd = client.commands.get(interaction.commandName);
    if (!cmd) {
      console.log(
        `[error] no command matching ${interaction.commandName} was found`
      );
      return;
    }
    console.log(
      `[info] <${interaction.guild!.name}> ${
        interaction.user.tag
      } executed the '${cmd.name}' command`
    );

    try {
      await cmd.run(client, interaction);
    } catch (error) {
      console.error(error);

      await interaction[
        interaction.replied || interaction.deferred ? "followUp" : "reply"
      ]({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  },
});
