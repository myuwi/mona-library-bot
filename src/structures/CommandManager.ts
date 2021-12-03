import { Collection } from 'discord.js';

import * as path from 'path';

import { __rootdir__ } from '../root';
import { Command } from '../types';
import { BaseLoader } from './BaseLoader';

export class CommandManager extends BaseLoader {
    private commands: Collection<string, Command>;

    constructor() {
        super();
        this.commands = new Collection();
    }

    public async register() {
        this.commands = new Collection();
        const cmdsRoot = path.join(__rootdir__, 'commands');

        const cmds = await this.readdirRecursive(cmdsRoot);

        for (const commandFile of cmds) {
            if (!/\.(t|j)s$/.test(commandFile)) continue;

            const command: Command = (await import(commandFile)).command;

            if (command && !command.disabled) {
                console.log(`Loading Command: ${command.name}`);
                this.commands.set(command.name, command);
                console.log(`Loaded Command: ${command.name}`);
            }
        }

        this.commands.sort((a, b) => a.name.localeCompare(b.name));
    }

    /**
     * Returns an array of currently loaded commands
     */
    public toArray() {
        return Array.from(this.commands, (c) => c[1]);
    }

    /**
     * Returns a Command with the specified name or alias
     * or `undefined` if the command does not exist.
     * @param {string} cmd - Command name or alias
     */
    public get(cmd: string) {
        return this.commands.get(cmd) || this.commands.find((c) => !!c.aliases?.includes(cmd)) || undefined;
    }
}
