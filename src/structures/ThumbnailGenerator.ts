import * as path from 'path';
import sharp from 'sharp';
import { GenshinData } from '../GenshinData';

type CharInfo = {
    name: string;
    rarity: number;
    path: string;
};

export class ThumbnailGenerator {
    private static async getPortraitFilePaths(characters: string[], fillFlex = false) {
        const files: CharInfo[] = [];

        for (let i = 0; i < characters.length; i++) {
            const characterName = characters[i];

            for (let j = 0; j < GenshinData.length; j++) {
                const data = GenshinData[j];

                if (data.name.toUpperCase().startsWith(characterName.toUpperCase())) {
                    files.push({
                        name: data.name,
                        rarity: data.rarity,
                        path: path.join('./assets/portraits', `${data.name}.png`)
                    });
                    break;
                }
            }
        }

        return files;
    }

    public static async simple(
        characters: string[]
    ) {
        if (!characters.length) return undefined;

        if (characters.length > 4) {
            characters = characters.slice(0, 4);
        }

        const files = await this.getPortraitFilePaths(characters, true);

        while (files.length < 4) {
            files.push({
                name: 'Flex',
                rarity: 1,
                path: path.join('./assets/portraits', 'Flex.png')
            });
        }

        const comps = files.map((file, i) => {
            return {
                input: file.path,
                top: 0,
                left: i * 256
            };
        });

        const buffer = sharp({
            create: {
                width: 1024,
                height: 256,
                channels: 4,
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            }
        }).composite(comps).png().toBuffer();

        return buffer;
    }

    public static async abyss(
        characters: string[],
        fillEmpty = true
    ) {
        if (!characters.length) return undefined;

        if (characters.length > 4) {
            characters = characters.slice(0, 4);
        }

        const data: (CharInfo | {})[] = await this.getPortraitFilePaths(characters, false);

        if (fillEmpty) {
            while (data.length < 4) {
                data.push({});
            }
        }

        const comps = data.reduce((acc: sharp.OverlayOptions[], cur, i) => {
            const x = 32 + 320 * i;

            // empty container
            if (!('name' in cur)) {
                const emptyComps: sharp.OverlayOptions[] = [
                    {
                        input: './assets/Rarity_1.png',
                        top: 32,
                        left: x
                    },
                    {
                        input: './assets/Name_Background.png',
                        top: 32,
                        left: x
                    },
                    {
                        input: './assets/names/--.png',
                        top: 288,
                        left: x
                    }
                ];

                return [...acc, ...emptyComps];
            }

            // character container
            const charComps: sharp.OverlayOptions[] = [
                {
                    input: `./assets/Rarity_${cur.rarity}.png`,
                    top: 32,
                    left: x
                },
                {
                    input: cur.path,
                    top: 32,
                    left: x
                },
                {
                    input: './assets/Name_Background.png',
                    top: 32,
                    left: x
                },
                {
                    input: `./assets/names/${cur.name}.png`,
                    top: 288,
                    left: x
                }
            ];

            return [...acc, ...charComps];
        }, []);

        const background = './assets/Abyss_Background.png';

        const buffer = sharp(background)
            .composite(comps)
            .png()
            .toBuffer();

        return buffer;
    }
}
