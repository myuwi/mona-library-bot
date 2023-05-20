import { Events } from "discord.js";
import { defineEvent } from "../lib/events";

export default defineEvent({
  name: Events.GuildCreate,
  run(_, guild) {
    console.log(`[info] joined a guild: ${guild.name}`);
  },
});
