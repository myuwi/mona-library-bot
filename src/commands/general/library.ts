import { Message, MessageEmbed } from 'discord.js';
import { MClient } from '../../client/MClient';
import * as EmbedUtils from '../../structures/EmbedUtils';
import { LibraryPurgeResponse, LibraryUpdateResponse, LibraryStatuses } from '../../structures/GuildComboLibraryManager';
import { PermissionLevel } from '../../structures/Permissions';
import { Command } from '../../types';

// TODO: Split into separate commands
export const command: Command = {
    name: 'library',
    description: 'Manage the combo library on the current server',
    aliases: ['lib', 'l'],
    group: 'General',
    usage: 'library [update | status | purge | channel <library | directory> <set <channel id> | unset> ]',
    permissionLevel: PermissionLevel.MODERATOR,
    disabled: true,
    run: async (message: Message, args: string[], client: MClient) => {
        if (!args.length) {
            return await message.channel.send({
                embeds: [EmbedUtils.error(`Usage: ${command.usage}`)],
            });
        }

        const [operation, ...options] = args;

        const guildLibraryManager = await client.comboLibraryManager.fetch(message.guild!);
        if (!guildLibraryManager) {
            return await message.channel.send({
                embeds: [EmbedUtils.error('Unble to get combo library configuration for the current server')],
            });
        }

        switch (operation) {
            case 'update': {
                if (options[0] === 'dir') {
                    try {
                        const statusMessage = await message.channel.send({ embeds: [EmbedUtils.info('Updating directory channel...')] });
                        await guildLibraryManager.updateDirectory();
                        await statusMessage.edit({ embeds: [EmbedUtils.success('Directory channel updated')] });
                    } catch (err: any) {
                        if (err.message === 'Library channel not set') {
                            return await message.channel.send({ embeds: [EmbedUtils.error('Library channel is not set')] });
                        }
                        console.error(err.toString());
                        return await message.channel.send({
                            embeds: [EmbedUtils.error('Unable to update directory channel: ' + err.message)],
                        });
                    }
                }

                try {
                    const statusMessage = await message.channel.send({ embeds: [EmbedUtils.info('Updating library channel...')] });

                    const resId = await guildLibraryManager.update();

                    try {
                        await statusMessage.edit({ embeds: [EmbedUtils.info('Updating directory channel...')] });
                        await guildLibraryManager.updateDirectory();
                    } catch (err: any) {
                        if (err.message !== 'Library channel not set') {
                            console.error(err.toString());
                            await message.channel.send({
                                embeds: [EmbedUtils.error('Unable to update directory channel: ' + err.message)],
                            });
                        }
                    }

                    const messages = {
                        [LibraryUpdateResponse.CHANNEL_NOT_SET]: EmbedUtils.error(
                            'The combo library channel has not been set on this server'
                        ),
                        [LibraryUpdateResponse.ALREADY_UP_TO_DATE]: EmbedUtils.success(
                            'The combo library is already up to date, no update was performed'
                        ),
                        [LibraryUpdateResponse.UPDATED]: EmbedUtils.success('The combo library channel has been updated succeessfully'),
                    };

                    if (messages[resId]) {
                        await statusMessage.edit({ embeds: [messages[resId]] });
                    }
                } catch (err: any) {
                    console.error(err.toString());

                    await message.channel.send({
                        embeds: [EmbedUtils.error('Something went wrong with the library update, see error log for more information')],
                    });
                }
                break;
            }
            case 'purge': {
                const statusMessage = await message.channel.send({
                    embeds: [EmbedUtils.info('Purging the combo library, please wait...')],
                });

                const resId = await guildLibraryManager.purge();

                const messages = {
                    [LibraryPurgeResponse.SUCCESS]: EmbedUtils.success('The combo library has been purged successfully'),
                    [LibraryPurgeResponse.CHANNEL_NOT_SET]: EmbedUtils.error('The combo library channel has not been set on this server'),
                    [LibraryPurgeResponse.NOT_FOUND]: EmbedUtils.error(
                        'Unable to purge the combo library channel, the channel is already empty'
                    ),
                };

                if (messages[resId]) {
                    await statusMessage.edit({ embeds: [messages[resId]] });
                }
                break;
            }
            case 'status': {
                const statusMessage = await message.channel.send({
                    embeds: [EmbedUtils.info('Checking library status, please wait...')],
                });

                const statusId = await guildLibraryManager.status();

                const guildSettings = await client.db.guilds.getOrInsert(message.guild!.id);

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
                    .setImage(
                        'https://cdn.discordapp.com/attachments/809845587905871914/875084375333687296/Namecard_Background_Mona_Starry_Sky_188px.png'
                    )
                    .setFooter({ text: client.user!.username })
                    .setTimestamp(Date.now())
                    .addField('Status', status)
                    .addField('Library Channel', guildSettings?.syncChannelId ? `<#${guildSettings.syncChannelId}>` : 'Unset', true)
                    .addField(
                        'Directory Channel',
                        guildSettings?.directoryChannelId ? `<#${guildSettings.directoryChannelId}>` : 'Unset',
                        true
                    );
                // .addField('Log Channel', guildSettings?.log_channel_id ? `<#${guildSettings.log_channel_id}>` : 'Unset', true)
                // .addField('Auto Sync', guildSettings?.auto_sync ? 'Enabled' : 'Disabled', true);

                statusMessage.edit({ embeds: [embed] });
                break;
            }
            // TODO: Clear old channel when changing channels
            case 'channel': {
                const dbColNames: Record<string, string> = {
                    library: 'syncChannelId',
                    directory: 'directoryChannelId',
                };

                if (!(options[0] in dbColNames)) {
                    return message.channel.send({ embeds: [EmbedUtils.info('A valid option is required')] });
                }

                const dbCol = dbColNames[options[0]];

                switch (options[1]) {
                    case 'set':
                        if (!options[2]) {
                            return message.channel.send({ embeds: [EmbedUtils.error('A channel id is required')] });
                        }

                        if (!/^\d+$/.test(options[2])) {
                            return message.channel.send({ embeds: [EmbedUtils.error('Invalid channel id')] });
                        }

                        let channelId;
                        try {
                            const fChannels = await message.guild!.channels.fetch();

                            const fChannel = fChannels.get(options[2]);

                            if (!fChannel) {
                                return message.channel.send({
                                    embeds: [EmbedUtils.error('A channel with the specified id could not be found on this server')],
                                });
                            }

                            if (fChannel.type !== 'GUILD_TEXT') {
                                return message.channel.send({
                                    embeds: [EmbedUtils.error("The channel with the specified id isn't a text channel")],
                                });
                            }

                            channelId = fChannel.id;
                        } catch (err: any) {
                            console.log(err);
                            return message.channel.send({
                                embeds: [EmbedUtils.error('An unspecified error occurred, check the error log')],
                            });
                        }

                        await client.db.guilds.update(message.guild!.id, { [dbCol]: channelId });

                        return await message.channel.send({
                            embeds: [EmbedUtils.success(`The \`${options[0]}\` channel has been set to <#${channelId}>`)],
                        });
                    case 'unset':
                        const statusMessage = await message.channel.send({
                            embeds: [EmbedUtils.info('Clearing channel, please wait...')],
                        });

                        switch (options[0]) {
                            case 'library':
                                await guildLibraryManager.purge();
                                break;
                            case 'directory':
                                await guildLibraryManager.purgeDirectory();
                                break;
                        }

                        await client.db.guilds.update(message.guild!.id, { [dbCol]: null });

                        return statusMessage.edit({ embeds: [EmbedUtils.success(`The \`${options[0]}\` channel has been unbound`)] });
                    default:
                        await message.channel.send({
                            embeds: [EmbedUtils.error(`Usage: ${command.usage}`)],
                        });
                }
                break;
            }
        }
    },
};
