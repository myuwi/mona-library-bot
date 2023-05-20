import { Events } from "discord.js";
import { defineEvent } from "../lib/events";

export default defineEvent({
  name: Events.ClientReady,
  once: true,
  run(client) {
    console.log(`Logged in as ${client.user!.tag}`);
  },
});
