import sharp from 'sharp';
import { Character, getCharacterFileName } from './GenshinData';

export class ThumbnailGenerator {
    public static async abyss(characters: Character[]) {
        if (characters.length > 4) {
            characters = characters.slice(0, 4);
        }

        let comps = characters.reduce((acc: sharp.OverlayOptions[], char, i) => {
            const x = 32 + 320 * i;

            const fileName = getCharacterFileName(char);

            // character container
            const charComps: sharp.OverlayOptions[] = [
                {
                    input: `./assets/Rarity_${char.rarity}.png`,
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

            return [...acc, ...charComps];
        }, []);

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

        const background = './assets/Abyss_Background.png';

        const buffer = sharp(background).composite(comps).png().toBuffer();

        return buffer;
    }
}
