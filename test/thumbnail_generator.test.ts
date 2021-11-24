import { access, mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { parseCharacters } from '../src/GenshinData';
import { ThumbnailGenerator } from '../src/ThumbnailGenerator';

const outputdir = path.join(__dirname, 'output');

describe('Thumbnail Generator tests', () => {
    // create an output folder if it doesn't exist
    beforeAll(async () => {
        try {
            await access(outputdir);
        } catch (err) {
            await mkdir(outputdir);
        }
    });

    test('should generate thumbnail', async () => {
        const charNames = ['Ayaka', 'Mona', 'Kazuha', 'Diona'];
        const chars = parseCharacters(charNames);

        const buffer = await ThumbnailGenerator.abyss(chars);
        expect(buffer).toBeInstanceOf(Buffer);

        await writeFile(path.join(outputdir, 'test.png'), buffer);
    });
});