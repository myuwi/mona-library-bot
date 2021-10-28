import { MessageEmbed } from 'discord.js';
import { colors } from '../colors';

export const singleLineEmbed = (message: string, status?: 'INFO' | 'SUCCESS' | 'ERROR') => {
    let icon;
    let color;
    switch (status) {
        case 'SUCCESS':
            icon = '<:checkmark:895744617696346212>';
            color = colors.success;
            break;
        case 'ERROR':
            icon = '<:alert:895742534914019388>';
            color = colors.error;
            break;
        case 'INFO':
        default:
            // icon = '<:info:896484880169443428>';
            color = colors.primary;
    }

    const m = icon ? `${icon} ${String.fromCharCode(8203)} ${String.fromCharCode(8203)} ${message}` : message;

    return new MessageEmbed({
        color,
        description: m
    });
};

export const info = (message: string) => singleLineEmbed(message, 'INFO');

export const success = (message: string) => singleLineEmbed(message, 'SUCCESS');

export const error = (message: string) => singleLineEmbed(message, 'ERROR');