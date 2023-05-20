import { ClientOptions, Collection, Client as DiscordClient } from "discord.js";
import { CommandOptions, loadCommands } from "./commands";
import { loadEvents } from "./events";

type Options = {
  commands?: string;
  events?: string;
  clientOptions: ClientOptions;
};

export class Client<
  Ready extends boolean = boolean
> extends DiscordClient<Ready> {
  public commands!: Collection<string, CommandOptions>;
  private opts: Omit<Options, "clientOptions">;

  constructor(options: Options) {
    const { clientOptions, ...opts } = options;
    super(clientOptions);
    this.opts = opts;
  }

  override async login(token?: string) {
    if (this.opts.events) {
      await loadEvents(this, this.opts.events);
    }

    if (this.opts.commands) {
      this.commands = await loadCommands(this.opts.commands);
    }

    return super.login(token);
  }
}
