import { ThumbnailGenerator } from '../structures/ThumbnailGenerator';
import { promises as fs } from 'fs';

(async () => {
    const characters = ['Mona', 'Bennett'];
    const image = await ThumbnailGenerator.abyss(characters);

    if (!image) return;

    await fs.writeFile('./test.png', image);
})();
