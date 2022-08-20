import { Constants } from 'discord.js';

import * as path from 'path';

import { __rootdir__ } from '../root';
import { BaseLoader } from './BaseLoader';
import { MClient } from '../client/MClient';

export class Events extends BaseLoader {
  public client: MClient;

  constructor(client: MClient) {
    super();
    this.client = client;
  }

  public async register() {
    const eventsRoot = path.join(__rootdir__, 'events');

    const eventFiles = await this.readdirRecursive(eventsRoot);
    const discordEvents = Object.values(Constants.Events);

    for (const eventFile of eventFiles) {
      if (!/\.(t|j)s$/.test(eventFile)) continue;

      const eventName = path.parse(eventFile).name;
      if (!eventName || !discordEvents.includes(eventName)) continue;

      console.log(`Loading Event: ${eventName}`);
      const { [eventName]: event } = await import(path.join(eventFile));

      this.client.on(eventName, event.bind(null, this.client));
      console.log(`Loaded Event: ${eventName}`);
    }
  }
}
