import { CharacterName, fuzzySearch, getCharacterByName } from '../src/GenshinData';

const expectEqual = (queries: string[], expected: CharacterName) => {
  const character = getCharacterByName(expected);
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
