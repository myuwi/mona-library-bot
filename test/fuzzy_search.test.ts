import { Characters, fuzzySearch } from '../src/GenshinData';

const getCharacter = (characterName: string) =>
  Characters.find((c) => c.name === characterName || c.aliases?.some((a) => a === characterName));

const expectEqual = (queries: string[], expected: string) => {
  const character = getCharacter(expected);
  expect(character).not.toBeUndefined();

  for (let i = 0; i < queries.length; i++) {
    expect(fuzzySearch(queries[i], false)?.name).toBe(character!.name);
  }
};

it('should find characters', async () => {
  expectEqual(['Ayaka', 'Kamisato Ayaka', 'Ayayaka'], 'Kamisato Ayaka');
  expectEqual(['Childe', 'Tartaglia'], 'Tartaglia');
  expectEqual(['Xingqiu', 'Xing Qiu', 'Xinqui'], 'Xingqiu');

  expectEqual(['qq'], 'Qiqi');
  expectEqual(['who tao'], 'Hu Tao');
});
