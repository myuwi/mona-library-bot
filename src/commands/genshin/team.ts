import { AttachmentBuilder, EmbedBuilder, Message, MessageEditOptions } from 'discord.js';
import { MClient } from '../../client/MClient';
import * as EmbedUtils from '../../structures/EmbedUtils';
import { Character, Characters, Elements, parseTeam } from '../../GenshinData';
import { GeneratorOptions, OptionsError, ThumbnailGenerator } from '../../ThumbnailGenerator';
import { PermissionLevel } from '../../structures/Permissions';
import { Command } from '../../types';

export const command: Command = {
  name: 'team',
  description: 'Generate a team image',
  group: 'Genshin',
  permissionLevel: PermissionLevel.HELPER,
  run: async (message: Message, args: string[], client: MClient) => {
    if (!args.length || args[0] === 'help') {
      const elements = Object.values(Elements)
        .map((e) => `\`${e.name}\``)
        .join(', ');

      const chars = Characters.map((c: Character) => {
        let aliases = [];
        if (c.displayName) aliases.push(c.displayName);
        if (c.aliases && c.aliases.length) aliases = [...aliases, ...c.aliases];

        let str = c.name;
        if (aliases.length) str += ` (${aliases.join(', ')})`;

        return `\`${str}\``;
      }).join(', ');

      return await message.channel.send(`**Available elements:**\n${elements}\n\n**Available characters:**\n${chars}`);
    }

    const imageOptions: GeneratorOptions = {};

    while (args[0].startsWith('--')) {
      const arg = args[0];

      const [key, value] = arg.split('=');

      switch (key) {
        case '--bg':
        case '--background':
          imageOptions.background = true;
          break;
        case '--nobg':
        case '--no-background':
          imageOptions.background = false;
          break;
        case '--size':
          if (!value) {
            return await message.channel.send({
              embeds: [EmbedUtils.error('Team size not specified')],
            });
          }

          if (!/^[0-9]+$/.test(value)) {
            return await message.channel.send({
              embeds: [EmbedUtils.error('Team size needs to be a numeric value')],
            });
          }

          imageOptions.size = parseInt(value);
          break;
        default:
          return await message.channel.send({
            embeds: [EmbedUtils.error('Invalid flag: ' + key)],
          });
      }

      args.shift();
    }

    try {
      ThumbnailGenerator.checkOptions(imageOptions);
    } catch (err: any) {
      if (err instanceof OptionsError) {
        return await message.channel.send({
          embeds: [EmbedUtils.error(err.message)],
        });
      }

      throw err;
    }

    const teamRaw = args
      .join(' ')
      .split(',')
      .map((e) => e.trim());

    let chars;
    try {
      chars = parseTeam(teamRaw, true);
    } catch (err: any) {
      if (err.message.startsWith('Unable to parse characters:')) {
        await message.channel.send({
          embeds: [EmbedUtils.error(err.message)],
        });
      }
      return;
    }

    if (!chars.length) {
      return await message.channel.send({
        embeds: [EmbedUtils.error('Invalid team! Team must have atleast one valid team member.')],
      });
    }

    const msg = await message.channel.send({ embeds: [EmbedUtils.info('Generating image...')] });

    const image = await ThumbnailGenerator.team(chars, imageOptions);

    if (!image) {
      return await message.channel.send({
        embeds: [EmbedUtils.error('Invalid team')],
      });
    }

    const embed = new EmbedBuilder().setTitle(chars.map((c) => c.name).join(', ')).setColor(client.colors.primary);

    const imageName = chars
      .map((m) => {
        const name = ('displayName' in m && m.displayName) || m.name;
        return name.toLowerCase().replace(' ', '');
      })
      .join('-');

    const messageOptions: MessageEditOptions = {
      embeds: [embed],
      files: [new AttachmentBuilder(image, { name: `${imageName}.png` })],
    };

    embed.setImage(`attachment://${imageName}.png`);

    await msg.edit(messageOptions);
  },
};
