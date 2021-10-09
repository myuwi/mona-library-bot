import { ComboLibraryManager } from '../structures/ComboLibraryManager';

const parser = new ComboLibraryManager();
(async () => {
    const doc = await parser.parseDoc();
    if (!doc) return console.log('No doc');

    const combos = ComboLibraryManager.parseCombos(doc);
    console.log(combos);
})();
