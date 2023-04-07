import { GuildMember } from 'discord.js';
import { MClient } from '../client/MClient';
import { Command } from '../types';

export enum PermissionLevel {
  BOT_OWNER = 'BOT_OWNER',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  HELPER = 'HELPER',
  MEMBER = 'MEMBER',
}

export const testPermissions = async (command: Command, member: GuildMember) => {
  const client = member.client as MClient;

  // Disallow override on commands with permission level 'BOT_OWNER'
  if (command.permissionLevel !== PermissionLevel.BOT_OWNER) {
    const userOverrides = (await client.db.guilds.permissions.users.getByUserId(member.guild.id, member.id)).filter(
      (o) => o.userId === member.id
    );

    // console.log(userOverrides);

    if (userOverrides.length) {
      const override = userOverrides.find((o) => o.commandName === command.name) || userOverrides.find((o) => o.commandName === '*');

      if (override) {
        return !!override.allow;
      }
    }

    const roleOverrides = (await client.db.guilds.permissions.roles.get(member.guild.id)).filter(
      (o) => o.commandName === '*' || o.commandName === command.name
    );

    const memberRoles = [...member.roles.cache.values()].sort((r1, r2) => member.guild.roles.comparePositions(r2, r1));

    // loop over the members roles
    for (let i = 0; i < memberRoles.length; i++) {
      const memberRole = memberRoles[i];

      const override =
        roleOverrides.find((o) => o.roleId === memberRole.id && o.commandName === command.name) ||
        roleOverrides.find((o) => o.roleId === memberRole.id && o.commandName === '*');

      if (override) {
        return !!override.allow;
      }
    }
  }

  // No permission override detected, use default permissions
  switch (command.permissionLevel) {
    case PermissionLevel.BOT_OWNER:
      return member.id === client.config.ownerId;
    case PermissionLevel.ADMIN:
      return member.id === member.guild.ownerId || member.permissions.any(['ManageGuild'], true);
    case PermissionLevel.MODERATOR:
      return member.id === member.guild.ownerId || member.permissions.any(['ManageChannels', 'ManageChannels'], true);
    case PermissionLevel.HELPER:
      return member.id === member.guild.ownerId || member.permissions.any(['ManageChannels', 'ManageGuild', 'ManageMessages'], true);
    case PermissionLevel.MEMBER:
      return true;
  }

  return false;
};
