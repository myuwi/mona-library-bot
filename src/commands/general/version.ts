import child_process from "child_process";
import { PermissionFlagsBits } from "discord.js";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import util from "util";
import { defineCommand } from "../../lib/commands";

const exec = util.promisify(child_process.exec);

export default defineCommand({
  name: "version",
  description: "Get bot version",
  permissions: PermissionFlagsBits.ManageMessages,
  async run(_, interaction) {
    const pkg = await readFile(resolve(__dirname, "../../../package.json"), {
      encoding: "utf8",
    });
    const version = JSON.parse(pkg).version;
    const revision = (await exec("git rev-parse HEAD")).stdout
      .slice(0, 7)
      .trim();

    await interaction.reply({
      content: `Currently running \`v${version} (${revision})\``,
      ephemeral: true,
    });
  },
});
