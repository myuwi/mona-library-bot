import { writeFile } from 'fs/promises';
import path from 'path';
import * as textToImage from 'text-to-image';
import { Character, Characters, getCharacterFileName } from './GenshinData';

(async () => {
    const data: Character[] = [
        {
            name: 'Empty',
            displayName: '--',
            rarity: 1
        },
        ...Characters
    ];

    for (let i = 0; i < data.length; i++) {
        const char = data[i];
        console.log(`Generating name file for: ${char.name}`);
        const name = char.displayName ?? char.name;

        const dataUri = await textToImage.generate(name, {
            fontPath: './assets/fonts/ja-jp.ttf',
            fontFamily: 'TT_Skip-E',
            fontSize: 36,
            bgColor: '#00000000',
            textColor: '#4f4e57',
            textAlign: 'center',
            customHeight: 56,
            lineHeight: 56,
            maxWidth: 256,
            margin: 6,
        });

        const fileName = getCharacterFileName(char);
        await writeFile(path.join(__dirname, `../assets/names/${fileName}.png`), Buffer.from(dataUri.split(',')[1], 'base64'));
        console.log(`Generated name file for: ${char.name}`);
    }
})();
