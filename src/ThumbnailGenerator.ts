import sharp from 'sharp';
import { Character, Element, getCharacterFileName } from './GenshinData';

export type GeneratorOptions = {
  background?: boolean;
  size?: number;
};

export type GeneratorData = Character | Element;

export const defaultOptions: Required<GeneratorOptions> = {
  background: false,
  size: 4,
};

export class OptionsError extends Error {
  constructor(message?: string | undefined) {
    super(message);
    this.name = 'OptionsError';

    Object.setPrototypeOf(this, OptionsError.prototype);
  }
}

export class ThumbnailGenerator {
  private static getComps = (characters: GeneratorData[], options: Required<GeneratorOptions>) => {
    let comps = characters.reduce((acc: sharp.OverlayOptions[], data, i) => {
      const x = 32 + 320 * i;

      let newComps: sharp.OverlayOptions[] = [];

      if ('rarity' in data) {
        const fileName = getCharacterFileName(data);
        // Character
        newComps = [
          {
            input: `./assets/Rarity_${data.rarity}.png`,
            top: 32,
            left: x,
          },
          {
            input: `./assets/portraits/${fileName}.png`,
            top: 32,
            left: x,
          },
          {
            input: './assets/Name_Background.png',
            top: 32,
            left: x,
          },
          {
            input: `./assets/names/${fileName}.png`,
            top: 288,
            left: x,
          },
        ];
      } else {
        // Element
        newComps = [
          {
            input: './assets/Rarity_1.png',
            top: 32,
            left: x,
          },
          {
            input: `./assets/elements/${data.name}.png`,
            top: 32,
            left: x,
          },
          {
            input: './assets/Name_Background.png',
            top: 32,
            left: x,
          },
          {
            input: `./assets/names/${data.name}.png`,
            top: 288,
            left: x,
          },
        ];
      }
      return [...acc, ...newComps];
    }, []);

    // Fill empty slots
    for (let i = characters.length; i <= options.size; i++) {
      const x = 32 + 320 * i;

      const emptyComps: sharp.OverlayOptions[] = [
        {
          input: './assets/Rarity_1.png',
          top: 32,
          left: x,
        },
        {
          input: './assets/Name_Background.png',
          top: 32,
          left: x,
        },
        {
          input: './assets/names/Empty.png',
          top: 288,
          left: x,
        },
      ];

      comps = [...comps, ...emptyComps];
    }

    return comps;
  };

  public static checkOptions(options: GeneratorOptions = {}) {
    const opts: Required<GeneratorOptions> = {
      ...defaultOptions,
      ...options,
    };

    if (opts.size < 1) {
      throw new OptionsError('Team size cannot be smaller than 1');
    }

    if (opts.size > 10) {
      throw new OptionsError('Team size cannot exceed the maximum allowed size (10)');
    }

    if (opts.background && opts.size !== 4) {
      throw new OptionsError('Background is only available with team size of 4');
    }
  }

  public static async team(data: GeneratorData[], options: GeneratorOptions = {}) {
    const opts: Required<GeneratorOptions> = {
      ...defaultOptions,
      ...options,
    };

    this.checkOptions(opts);

    if (data.length > opts.size) {
      data = data.slice(0, opts.size);
    }

    const comps = this.getComps(data, opts);

    let s;
    if (opts.background) {
      const background = './assets/Abyss_Background.png';
      s = sharp(background);
    } else {
      s = sharp({
        create: {
          width: (256 + 64) * opts.size,
          height: 376,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        },
      });
    }

    const buffer = s.composite(comps).png().toBuffer();

    return buffer;
  }
}
