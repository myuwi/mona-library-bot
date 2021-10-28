import { HexColorString, Message } from 'discord.js';
import { MClient } from '../client/MClient';
import { PermissionLevel } from '../structures/Permissions';

export type Command = {
    /** Name of the command */
    name: string;
    /** An array of aliases that can be used to call the command */
    aliases?: string[];
    /** A description describing the command */
    description: string;
    /** The group this command belongs to */
    group: string;
    /** The command's usage */
    usage?: string;
    /** An array of usage examples for the command */
    examples?: { value: string, description: string }[];
    /** Permissions required to use the command */
    permissionLevel: PermissionLevel;
    /** Is the command disabled? */
    disabled?: boolean;
    /** Is the command hidden from the help menu? */
    hidden?: boolean;
    /** The function to run when the command is executed */
    run: (message: Message, args: string[], client: MClient) => Promise<unknown>;
}

export type CommandArg = {
    name: string;
    description?: string;
    type: CommandArgType;
    required?: boolean;
    args?: CommandArg[];
}

export type CommandArgType = 'STRING' | 'NUMBER' | 'BOOLEAN' | 'USER' | 'ROLE' | 'CHANNEL';
