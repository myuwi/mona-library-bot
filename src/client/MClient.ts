import { Client, Intents } from 'discord.js';

import { Commands } from '../structures/Commands';
import { ComboLibraryManager } from '../structures/ComboLibraryManager';
import { Events } from '../structures/Events';
import { db } from '../database/db';
import { createSchema } from '../database/schema';
import { config } from '../../config';

export class MClient extends Client {
    public commands: Commands;
    public events: Events;
    public comboLib: ComboLibraryManager;
    public db: typeof db;
    public config: typeof config;

    constructor() {
        super({
            intents: [
                Intents.FLAGS.GUILDS,
                Intents.FLAGS.GUILD_MESSAGES
            ]
        });
        this.commands = new Commands();
        this.events = new Events(this);
        this.comboLib = new ComboLibraryManager(this);
        this.db = db;
        this.config = config;
    }

    private async init() {
        await this.events.register();
        await this.commands.register();
    }

    public async start(token: string) {
        await createSchema();
        await this.init();
        await this.login(token);

        return this;
    }
}