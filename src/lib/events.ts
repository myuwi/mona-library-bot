import chalk from "chalk";
import { Awaitable, ClientEvents, Events } from "discord.js";
import { z } from "zod";
import { find } from "../utils";
import { Client } from "./Client";

export const EventSchema = z.object({
  name: z
    .string()
    .refine((name) => Object.values(Events).some((e) => e === name)),
  once: z.boolean().optional(),
  run: z.function(),
});

export function isEvent<T extends keyof ClientEvents = never>(
  event: unknown
): event is EventOptions<T> {
  const res = EventSchema.safeParse(event);
  return res.success;
}

export async function loadEvents(client: Client, dir: string) {
  const eventFiles = await find(dir, { matching: /\.ts$/ });

  for (const file of eventFiles) {
    const event = (await import(file)).default;

    if (!isEvent(event)) {
      console.log(
        `[${chalk.yellow("warn")}] ${file} doesn't contain a valid event`
      );
      continue;
    }

    client[event.once ? "once" : "on"](event.name, async (...args: never[]) =>
      event.run(client, ...args)
    );
    console.log(`[info] loaded event: ${event.name}`);
  }
}

export type EventOptions<E extends keyof ClientEvents> = {
  name: E;
  once?: boolean;
  // TODO: dedupe client param on some events?
  run: (client: Client<true>, ...args: ClientEvents[E]) => Awaitable<void>;
};

export function defineEvent<E extends keyof ClientEvents>(
  options: EventOptions<E>
): EventOptions<E> {
  return options;
}
