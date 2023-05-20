import chalk from "chalk";
import {
  ApplicationCommandOption,
  Awaitable,
  ChatInputCommandInteraction,
  Collection,
  PermissionResolvable,
  PermissionsBitField,
  RESTPostAPIApplicationCommandsJSONBody,
} from "discord.js";
import type { Simplify } from "type-fest";
import { find } from "../utils";
import { Client } from "./Client";

export async function loadCommands(dir: string) {
  const cmdFiles = await find(dir, { matching: /\.ts$/ });

  const cmds = new Collection<string, Command>();
  for (const file of cmdFiles) {
    const cmd = (await import(file)).default as Command;

    if (!cmd) {
      console.log(
        `[${chalk.yellow("warn")}] ${file} doesn't contain a valid command`
      );
      continue;
    }

    cmds.set(cmd.name, cmd);
    console.log(`[info] loaded command: ${cmd.name}`);
  }

  return cmds;
}

export type CommandOptions = {
  name: string;
  description: string;
  options?: ApplicationCommandOption[];
  permissions?: PermissionResolvable;
  run(
    client: Client<true>,
    interaction: ChatInputCommandInteraction
  ): Awaitable<unknown>;
};

export type Command = Simplify<
  CommandOptions & {
    json(): RESTPostAPIApplicationCommandsJSONBody;
  }
>;

export function defineCommand(options: CommandOptions): Command {
  return {
    ...options,
    json(): RESTPostAPIApplicationCommandsJSONBody {
      const permissions = options.permissions
        ? new PermissionsBitField(options.permissions).bitfield.toString()
        : null;

      return {
        name: options.name,
        description: options.description,
        options: options.options,
        default_member_permissions: permissions,
        dm_permission: false,
      };
    },
  };
}
