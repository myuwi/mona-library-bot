import { REST, Routes } from "discord.js";
import * as dotenv from "dotenv";
import { loadCommands } from "./lib/commands";

dotenv.config();

const { TOKEN } = process.env;

if (!TOKEN) {
  console.log("TOKEN is missing");
  process.exit(1);
}

const clientId = Buffer.from(TOKEN.split(".")[0]!, "base64").toString();

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  const commands = [...(await loadCommands("src/commands")).values()].map(
    (cmd) => cmd.json()
  );

  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(Routes.applicationCommands(clientId), {
      body: commands,
    });

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();
