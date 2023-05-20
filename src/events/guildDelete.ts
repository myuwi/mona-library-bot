import { Events } from "discord.js";
import { defineEvent } from "../lib/events";

export default defineEvent({
  name: Events.GuildDelete,
  run(_, guild) {
    console.log(`[info] left a guild: ${guild.name}`);
  },
});
