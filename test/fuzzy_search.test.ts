import { Character, Characters, fuzzySearch } from '../src/GenshinData';

describe('Fuzzy search tests', () => {
    test('should find characters', async () => {
        const expectEqual = (queries: string[], expected: Character) => {
            for (let i = 0; i < queries.length; i++) {
                expect(fuzzySearch(queries[i], true)?.name).toBe(expected.name);
            }
        };

        expectEqual(['Ayaka', 'Kamisato Ayaka', 'Ayayaka'], Characters.KAMISATO_AYAKA);
        expectEqual(['Childe', 'Tartaglia'], Characters.TARTAGLIA);
        expectEqual(['Xingqiu', 'Xing Qiu', 'Xinqui'], Characters.XINGQIU);

        expectEqual(['qq'], Characters.QIQI);
        expectEqual(['who tao'], Characters.HU_TAO);
    });
});
