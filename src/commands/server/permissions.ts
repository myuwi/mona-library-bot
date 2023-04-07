import { EmbedBuilder, Message } from 'discord.js';

import { MClient } from '../../client/MClient';
import * as EmbedUtils from '../../structures/EmbedUtils';
import { PermissionLevel } from '../../structures/Permissions';
import { Command } from '../../types';

/*
    TODO: Check whether the user has permission to change the command permissions

    1.  Is the role that the user is trying to modify higher in the role hierarchy than
        the role of the user which is permitting them to use the permissions command?
    2.  Does the user have permission to use the target command?
    3.  Is the role the user is trying to remove the permission from the same role that
        is the highest role that is giving them the permission to use the target command?
*/

export const command: Command = {
  name: 'permissions',
  description: 'Manage bot command permissions',
  group: 'Server',
  usage: 'permissions [role <role id | everyone> | user <user id>] <command name> <allow | deny | reset>',
  examples: [
    {
      value: 'permissions user 186854817560395778 prefix allow',
      description: 'Allows a user to use the prefix command',
    },
    {
      value: 'permissions role 809802091768971355 ping deny',
      description: 'Denies a role access to the ping command',
    },
  ],
  permissionLevel: PermissionLevel.BOT_OWNER,
  run: async (message: Message, args: string[], client: MClient) => {
    const [mode, id, commandName, value] = args;

    if (!mode) {
      const roleOverrides = await client.db.guilds.permissions.roles.get(message.guild!.id);

      const embed = new EmbedBuilder().setTitle('Permissions overrides').setColor(client.colors.primary);

      const roleOverrideArr = [];

      for (let i = 0; i < roleOverrides.length; i++) {
        const override = roleOverrides[i];
        roleOverrideArr.push(`<@&${override.roleId}> (${override.roleId}) ${override.commandName} ${override.allow ? 'allow' : 'deny'}`);
      }

      if (roleOverrideArr.length) {
        embed.addFields({ name: 'Roles', value: roleOverrideArr.join('\n') });
      }

      const userOverrides = await client.db.guilds.permissions.users.get(message.guild!.id);

      const userOverrideArr = [];
      for (let i = 0; i < userOverrides.length; i++) {
        const override = userOverrides[i];
        userOverrideArr.push(`<@${override.userId}> (${override.userId}) ${override.commandName} ${override.allow ? 'allow' : 'deny'}`);
      }

      if (userOverrideArr.length) {
        embed.addFields({ name: 'Users', value: userOverrideArr.join('\n') });
      }

      if (!embed.data.fields?.length) {
        embed.setDescription('No permissions overrides found on this server');
      }

      return await message.channel.send({ embeds: [embed] });
    }

    // TODO: Improve error handling
    if (!id || !commandName || !value) {
      return await message.channel.send({ embeds: [EmbedUtils.error(`Usage: \`${command.usage}\``)] });
    }

    let idIsValid = false;
    switch (mode) {
      case 'role':
        try {
          const roleId = id === 'everyone' ? message.guild!.id : id;
          const role = await message.guild!.roles.fetch(roleId);
          if (!role) throw new Error(`Role with id '${roleId}' not found`);

          console.log({
            name: role.name,
            id: role.id,
          });

          idIsValid = true;
        } catch (err) {
          console.log(err);
          return await message.channel.send({ embeds: [EmbedUtils.error(`A role with the id of \`${id}\` could not be found`)] });
        }

        break;
      case 'user':
        try {
          const member = await message.guild!.members.fetch(id);
          if (!member) throw new Error(`User with id '${id}' not found`);

          console.log({
            name: member.user.username,
            id: member.id,
          });

          idIsValid = true;
        } catch (err) {
          console.log(err);
          return await message.channel.send({ embeds: [EmbedUtils.error(`A role with the id of \`${id}\` could not be found`)] });
        }

        break;
      default:
        return await message.channel.send({ embeds: [EmbedUtils.error('First argument needs to be either `role` or `user`')] });
    }

    if (commandName !== '*') {
      const command = client.commands.get(commandName);
      if (!command) {
        return await message.channel.send({
          embeds: [EmbedUtils.error(`A command with the name \`${commandName}\` could not be found`)],
        });
      }

      if (command.permissionLevel === PermissionLevel.BOT_OWNER) {
        return await message.channel.send({
          embeds: [EmbedUtils.error('The permissions of commands with a permission level of `BOT_OWNER` cannot be overridden!')],
        });
      }
    }

    let action: boolean | null;

    switch (value) {
      case 'allow':
        action = true;
        break;
      case 'deny':
        action = false;
        break;
      case 'reset':
      case 'remove':
        action = null;
        break;
      default:
        return await message.channel.send({ embeds: [EmbedUtils.error('Invalid value for command permission override')] });
    }

    let msg;
    switch (mode) {
      case 'role':
        switch (action) {
          case true:
            msg = `Permission override for the '${commandName}' command on role <@&${id}> was set to 'allow'`;
            break;
          case false:
            msg = `Permission override for the '${commandName}' command on role <@&${id}> was set to 'deny'`;
            break;
          case null:
            msg = `Permission override for the '${commandName}' command on role <@&${id}> was removed`;
            break;
        }
        await client.db.guilds.permissions.roles.update(message.guildId!, id, commandName, action);
        break;
      case 'user':
        switch (action) {
          case true:
            msg = `Permission override for the '${commandName}' command for user <@${id}> was set to 'allow'`;
            break;
          case false:
            msg = `Permission override for the '${commandName}' command for user <@${id}> was set to 'deny'`;
            break;
          case null:
            msg = `Permission override for the '${commandName}' command for user <@${id}> was removed`;
            break;
        }
        await client.db.guilds.permissions.users.update(message.guildId!, id, commandName, action);
        break;
      default:
        return await message.channel.send({ embeds: [EmbedUtils.info('There was an issue updating permissions')] });
    }

    const embed = EmbedUtils.success(msg);
    return message.channel.send({ embeds: [embed] });
  },
};
