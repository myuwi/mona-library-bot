import { Character, Characters, fuzzySearch } from '../src/GenshinData';

const expectEqual = (queries: string[], expected: Character) => {
    for (let i = 0; i < queries.length; i++) {
        expect(fuzzySearch(queries[i], false)?.name).toBe(expected.name);
    }
};

it('should find characters', async () => {
    expectEqual(['Ayaka', 'Kamisato Ayaka', 'Ayayaka'], Characters.KAMISATO_AYAKA);
    expectEqual(['Childe', 'Tartaglia'], Characters.TARTAGLIA);
    expectEqual(['Xingqiu', 'Xing Qiu', 'Xinqui'], Characters.XINGQIU);

    expectEqual(['qq'], Characters.QIQI);
    expectEqual(['who tao'], Characters.HU_TAO);
});
