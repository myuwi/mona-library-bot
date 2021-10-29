import { Message, MessageEmbed } from 'discord.js';
import { MClient } from '../../client/MClient';
import * as EmbedUtils from '../../structures/EmbedUtils';
import { LibraryPurgeResponse, LibraryUpdateResponse, LibraryStatuses } from '../../structures/GuildComboLibraryManager';
import { PermissionLevel } from '../../structures/Permissions';
import { Command } from '../../types';

export const command: Command = {
    name: 'library',
    description: 'Manage the combo library on the current channel',
    group: 'General',
    usage: 'library <update | status | purge | channel [set <channel id> | unset]>',
    permissionLevel: PermissionLevel.MODERATOR,
    run: async (message: Message, args: string[], client: MClient) => {
        if (!args.length) return message.channel.send('No args');

        const [operation, ...options] = args;

        const guildLibraryManager = await client.comboLibraryManager.fetch(message.guild!);
        if (!guildLibraryManager) {
            return await message.channel.send({
                embeds: [
                    EmbedUtils.error('Unble to get combo library configuration for the current server')
                ]
            });
        }

        switch (operation) {
            case 'update': {
                if (options[0] === 'dir') {
                    return await guildLibraryManager.updateDirectory();
                }

                try {
                    const statusMessage = await message.channel.send({
                        embeds: [
                            EmbedUtils.info('Attempting to update library, please wait...')
                        ]
                    });

                    const resId = await guildLibraryManager.update();

                    try {
                        await guildLibraryManager.updateDirectory();
                    } catch (err: any) {
                        console.error(err.toString());
                        await message.channel.send({ embeds: [EmbedUtils.error('Unable to update directory channel: ' + err.message)] });
                    }

                    const messages = {
                        [LibraryUpdateResponse.CHANNEL_NOT_SET]:
                            EmbedUtils.error('The combo library channel has not been set on this server'),
                        [LibraryUpdateResponse.ALREADY_UP_TO_DATE]:
                            EmbedUtils.success('The combo library is already up to date, no update was performed'),
                        [LibraryUpdateResponse.UPDATED]:
                            EmbedUtils.success('The combo library channel has been updated succeessfully')
                    };

                    if (messages[resId]) {
                        await statusMessage.edit({ embeds: [messages[resId]] });
                    }
                } catch (err: any) {
                    console.error(err.toString());

                    await message.channel.send({
                        embeds: [
                            EmbedUtils.error('Something went wrong with the library update, see error log for more information')
                        ]
                    });
                }
                break;
            }
            case 'purge': {
                const statusMessage = await message.channel.send({
                    embeds: [
                        EmbedUtils.info('Purging the combo library, please wait...')
                    ]
                });

                const resId = await guildLibraryManager.purge();

                const messages = {
                    [LibraryPurgeResponse.SUCCESS]:
                        EmbedUtils.success('The combo library has been purged successfully'),
                    [LibraryPurgeResponse.CHANNEL_NOT_SET]:
                        EmbedUtils.error('The combo library channel has not been set on this server'),
                    [LibraryPurgeResponse.NOT_FOUND]:
                        EmbedUtils.error('Unable to purge the combo library channel, the channel is already empty')
                };

                if (messages[resId]) {
                    await statusMessage.edit({ embeds: [messages[resId]] });
                }
                break;
            }
            case 'status': {
                const statusMessage = await message.channel.send({
                    embeds: [
                        EmbedUtils.info('Checking library status, please wait...')
                    ]
                });

                const statusId = await guildLibraryManager.status();

                const guildSettings = await client.db.guilds.settings.get(message.guild!.id);

                let status: string;
                switch (statusId) {
                    case LibraryStatuses.NOT_FOUND:
                        status = 'Not synced';
                        break;
                    case LibraryStatuses.LENGTH_MISMATCH:
                    case LibraryStatuses.OUT_OF_DATE:
                        status = 'Out of Date';
                        break;
                    case LibraryStatuses.UP_TO_DATE:
                        status = 'Up to date';
                        break;
                    case LibraryStatuses.CHANNEL_NOT_SET:
                        status = 'Channel not set';
                        break;
                    default:
                        status = 'Unknown';
                }

                const embed = new MessageEmbed()
                    .setTitle('Combo Library Status')
                    .setColor(client.colors.primary)
                    .setImage('https://cdn.discordapp.com/attachments/809845587905871914/875084375333687296/Namecard_Background_Mona_Starry_Sky_188px.png')
                    .setFooter(client.user!.username)
                    .setTimestamp(Date.now())
                    .addField('Status', status)
                    .addField('Library Channel', guildSettings?.sync_channel_id ? `<#${guildSettings.sync_channel_id}>` : 'Unset', true)
                    .addField('Directory Channel', guildSettings?.directory_channel_id ? `<#${guildSettings.directory_channel_id}>` : 'Unset', true);
                // .addField('Log Channel', guildSettings?.log_channel_id ? `<#${guildSettings.log_channel_id}>` : 'Unset', true)
                // .addField('Auto Sync', guildSettings?.auto_sync ? 'Enabled' : 'Disabled', true);

                statusMessage.edit({ embeds: [embed] });
                break;
            }
            case 'channel': {
                if (!options[0]) {
                    const guildSettings = await client.db.guilds.settings.get(message.guild!.id);
                    const channelId = guildSettings?.sync_channel_id;

                    if (channelId) {
                        const embed = EmbedUtils.info(`The combo library is currently linked to <#${channelId}>`);
                        return message.channel.send({ embeds: [embed] });
                    } else {
                        const embed = EmbedUtils.info('The combo library isn\'t currently linked to a channel');
                        return message.channel.send({ embeds: [embed] });
                    }
                }

                if (options[0] === 'set') {
                    let channelId;
                    if (options[1]) {
                        if (!(/^\d+$/.test(options[1]))) {
                            const embed = EmbedUtils.error('Malformed channel id');

                            return message.channel.send({ embeds: [embed] });
                        }

                        try {
                            const fChannels = await message.guild!.channels.fetch();

                            const fChannel = fChannels.get(options[1]);

                            if (!fChannel) {
                                const embed = EmbedUtils.error('A channel with the specified id could not be found on this server');

                                return message.channel.send({ embeds: [embed] });
                            }

                            if (fChannel.type !== 'GUILD_TEXT') {
                                const embed = EmbedUtils.error('The channel with the specified id isn\'t a text channel');

                                return message.channel.send({ embeds: [embed] });
                            }

                            channelId = fChannel.id;
                        } catch (err: any) {
                            console.log(err);

                            const embed = EmbedUtils.error('An unspecified error occurred, check the error log');

                            return message.channel.send({ embeds: [embed] });
                        }
                    } else {
                        channelId = message.channel.id;
                    }

                    await client.db.guilds.settings.update(message.guild!.id, { sync_channel_id: channelId });

                    return await message.channel.send({
                        embeds: [
                            EmbedUtils.success(`The combo library has been bound to <#${channelId}>`)
                        ]
                    });
                } else if (options[0] === 'unset') {
                    const statusMessage = await message.channel.send({
                        embeds: [
                            EmbedUtils.info('Clearing channel, please wait...')
                        ]
                    });

                    await guildLibraryManager.purge();

                    await client.db.guilds.settings.update(message.guild!.id, { sync_channel_id: null });

                    return statusMessage.edit({ embeds: [EmbedUtils.success('The combo library has been unbound')] });
                }
                break;
            }
            // TODO: Refactor duplicate code
            case 'directory': {
                if (!options[0]) {
                    const guildSettings = await client.db.guilds.settings.get(message.guild!.id);
                    const channelId = guildSettings?.directory_channel_id;

                    if (channelId) {
                        const embed = EmbedUtils.info(`The combo library directory is currently linked to <#${channelId}>`);
                        return message.channel.send({ embeds: [embed] });
                    } else {
                        const embed = EmbedUtils.info('The combo library directory isn\'t currently linked to a channel');
                        return message.channel.send({ embeds: [embed] });
                    }
                }

                if (options[0] === 'set') {
                    let channelId;
                    if (options[1]) {
                        if (!(/^\d+$/.test(options[1]))) {
                            const embed = EmbedUtils.error('Malformed channel id');

                            return message.channel.send({ embeds: [embed] });
                        }

                        try {
                            const fChannels = await message.guild!.channels.fetch();

                            const fChannel = fChannels.get(options[1]);

                            if (!fChannel) {
                                const embed = EmbedUtils.error('A channel with the specified id could not be found on this server');

                                return message.channel.send({ embeds: [embed] });
                            }

                            if (fChannel.type !== 'GUILD_TEXT') {
                                const embed = EmbedUtils.error('The channel with the specified id isn\'t a text channel');

                                return message.channel.send({ embeds: [embed] });
                            }

                            channelId = fChannel.id;
                        } catch (err: any) {
                            console.log(err);

                            const embed = EmbedUtils.error('An unspecified error occurred, check the error log');

                            return message.channel.send({ embeds: [embed] });
                        }
                    } else {
                        channelId = message.channel.id;
                    }

                    await client.db.guilds.settings.update(message.guild!.id, { directory_channel_id: channelId });

                    return await message.channel.send({
                        embeds: [
                            EmbedUtils.success(`The combo library directory has been bound to <#${channelId}>`)
                        ]
                    });
                } else if (options[0] === 'unset') {
                    const statusMessage = await message.channel.send({
                        embeds: [
                            EmbedUtils.info('Unbinding directory channel, please wait...')
                        ]
                    });

                    // await guildLibraryManager.purge();

                    await client.db.guilds.settings.update(message.guild!.id, { directory_channel_id: null });

                    return statusMessage.edit({ embeds: [EmbedUtils.success('The combo library directory channel has been unbound')] });
                }
                break;
            }
        }
    }
};
