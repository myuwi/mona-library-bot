import sharp from 'sharp';
import { Character, Element, getCharacterFileName } from './GenshinData';

export class ThumbnailGenerator {
    public static async abyss(characters: (Character | Element)[], hasBackground = true) {
        if (characters.length > 4) {
            characters = characters.slice(0, 4);
        }

        let comps = characters.reduce((acc: sharp.OverlayOptions[], e, i) => {
            const x = 32 + 320 * i;

            let newComps: sharp.OverlayOptions[] = [];

            if ('rarity' in e) {
                const fileName = getCharacterFileName(e);
                // Character
                newComps = [
                    {
                        input: `./assets/Rarity_${e.rarity}.png`,
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
                        input: `./assets/elements/${e.name}.png`,
                        top: 32,
                        left: x,
                    },
                    {
                        input: './assets/Name_Background.png',
                        top: 32,
                        left: x,
                    },
                    {
                        input: `./assets/names/${e.name}.png`,
                        top: 288,
                        left: x,
                    },
                ];
            }
            return [...acc, ...newComps];
        }, []);

        // Fill empty slots
        for (let i = characters.length; i <= 4; i++) {
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

        let s;
        if (hasBackground) {
            const background = './assets/Abyss_Background.png';
            s = sharp(background);
        } else {
            s = sharp({
                create: {
                    width: 1280,
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
