import { HexColorString, Message } from 'discord.js';
import { MClient } from '../client/MClient';

export type Config = {
    'ownerId': string;
    'defaultPrefix': string;
    'colors': {
        'primary': HexColorString;
        'success': HexColorString;
        'error': HexColorString;
    }
};

export type Command = {
    /** Name of the command */
    name: string;
    /** An array of aliases that can be used to call the command */
    aliases?: string[];
    /** A description describing the command */
    description: string;
    /** Usage examples for the command */
    usage?: string[];
    /** Is the command is disabled? */
    disabled?: boolean;
    /** Is the command hidden from the help menu? */
    hidden?: boolean;
    /** Mark the command as only usable by the bot owner */
    ownerOnly?: boolean;
    /** The function to run when the command is executed */
    run: (message: Message, args: string[], client: MClient) => Promise<unknown>;
}
