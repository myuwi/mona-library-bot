import child_process from "child_process";
import { PermissionFlagsBits } from "discord.js";
import util from "util";
import pkg from "../../../package.json";
import { defineCommand } from "../../lib/commands";

const exec = util.promisify(child_process.exec);

export default defineCommand({
  name: "version",
  description: "Get bot version",
  permissions: PermissionFlagsBits.ManageMessages,
  async run(_, interaction) {
    const revision = (await exec("git rev-parse HEAD")).stdout
      .slice(0, 7)
      .trim();

    await interaction.reply({
      content: `Currently running \`v${pkg.version} (${revision})\``,
      ephemeral: true,
    });
  },
});
