import { access, mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { getCharacterByName, parseTeam } from '../src/GenshinData';
import { ThumbnailGenerator } from '../src/ThumbnailGenerator';

const outputdir = path.join(__dirname, 'output');

const writeOutput = async (fileName: string, buffer: Buffer) => {
  await writeFile(path.join(outputdir, fileName), buffer);
};

// create an output folder if it doesn't exist
beforeAll(async () => {
  try {
    await access(outputdir);
  } catch (err) {
    await mkdir(outputdir);
  }
});

it('should generate image with background', async () => {
  const charNames = ['Ayaka', 'Mona', 'Kazuha', 'Diona'];
  const data = parseTeam(charNames);

  const buffer = await ThumbnailGenerator.team(data, { background: true });
  expect(buffer).toBeInstanceOf(Buffer);

  await writeOutput('with_background.png', buffer);
});

it('should generate image without background', async () => {
  const data = (['Kamisato Ayaka', 'Mona', 'Kaedehara Kazuha', 'Diona'] as const).map((c) => getCharacterByName(c));

  const buffer = await ThumbnailGenerator.team(data, { background: false });
  expect(buffer).toBeInstanceOf(Buffer);

  await writeOutput('without_background.png', buffer);
});

it('should generate images with different sizes', async () => {
  const data = (['Kamisato Ayaka', 'Mona', 'Kaedehara Kazuha', 'Diona', 'Shenhe', 'Rosaria', 'Ganyu', 'Kamisato Ayato'] as const).map((c) =>
    getCharacterByName(c)
  );

  for (let i = 1; i <= data.length; i++) {
    const buffer = await ThumbnailGenerator.team(data, { background: false, size: i });
    expect(buffer).toBeInstanceOf(Buffer);

    await writeOutput(`team_size_${i}.png`, buffer);
  }
});
