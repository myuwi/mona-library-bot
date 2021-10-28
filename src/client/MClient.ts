import { Client, Intents } from 'discord.js';

import { CommandManager } from '../structures/CommandManager';
import { ComboLibraryManager } from '../structures/ComboLibraryManager';
import { Events } from '../structures/Events';
import { db } from '../database/db';
import { createSchema } from '../database/schema';
import { colors } from '../colors';
import { config } from '../load-config';

export class MClient extends Client {
    public commands: CommandManager;
    public events: Events;
    public comboLibraryManager: ComboLibraryManager;
    public db: typeof db;
    public config: typeof config;
    public colors: typeof colors;

    constructor() {
        super({
            intents: [
                Intents.FLAGS.GUILDS,
                Intents.FLAGS.GUILD_MESSAGES
            ]
        });
        this.commands = new CommandManager();
        this.events = new Events(this);
        this.colors = colors;
        this.config = config;
        this.comboLibraryManager = new ComboLibraryManager(this, this.config.documentId);
        this.db = db;
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