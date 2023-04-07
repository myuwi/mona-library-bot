import { PrismaClient } from '@prisma/client';
import { Client, GatewayIntentBits } from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';

import { colors } from '../colors';
import { db } from '../database/db';
import { config } from '../load-config';
import { __rootdir__ } from '../root';
import { ComboLibraryManager } from '../structures/ComboLibraryManager';
import { CommandManager } from '../structures/CommandManager';
import { Events } from '../structures/Events';

const prisma = new PrismaClient();

export class MClient extends Client {
  public commands: CommandManager;
  public events: Events;
  public comboLibraryManager: ComboLibraryManager;
  public db;
  public config: typeof config;
  public colors: typeof colors;
  public version: string;

  constructor() {
    super({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
    });
    this.commands = new CommandManager();
    this.events = new Events(this);
    this.colors = colors;
    this.config = config;
    this.comboLibraryManager = new ComboLibraryManager(this, this.config.documentId);
    this.db = db(prisma);

    this.version = this.getVersion();
  }

  private getVersion() {
    const packageJson = path.join(__rootdir__, '..', 'package.json');
    const version = JSON.parse(fs.readFileSync(packageJson, 'utf-8')).version;
    return version;
  }

  private async init() {
    await this.events.register();
    await this.commands.register();
  }

  public async run() {
    await this.init();
    await this.login(this.config.token);

    return this;
  }
}
