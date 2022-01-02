import { Client, Intents } from 'discord.js';

import { CommandManager } from '../structures/CommandManager';
import { ComboLibraryManager } from '../structures/ComboLibraryManager';
import { Events } from '../structures/Events';
import { db } from '../database/db';
import { createSchema } from '../database/schema';
import { colors } from '../colors';
import { config } from '../load-config';
import * as path from 'path';
import * as fs from 'fs';
import { __rootdir__ } from '../root';

export class MClient extends Client {
    public commands: CommandManager;
    public events: Events;
    public comboLibraryManager: ComboLibraryManager;
    public db: typeof db;
    public config: typeof config;
    public colors: typeof colors;
    public version: string;

    constructor() {
        super({
            intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
        });
        this.commands = new CommandManager();
        this.events = new Events(this);
        this.colors = colors;
        this.config = config;
        this.comboLibraryManager = new ComboLibraryManager(this, this.config.documentId);
        this.db = db;

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
        await createSchema();
        await this.init();
        await this.login(this.config.token);

        return this;
    }
}
