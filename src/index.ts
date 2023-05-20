import { GatewayIntentBits } from "discord.js";
import * as dotenv from "dotenv";
import { Client } from "./lib/Client";

dotenv.config();

const client = new Client({
  commands: "src/commands",
  events: "src/events",
  clientOptions: {
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  },
});

client.login(process.env.TOKEN);
