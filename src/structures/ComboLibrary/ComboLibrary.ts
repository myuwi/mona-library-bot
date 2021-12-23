import { ComboLibraryElement } from './ComboLibraryElement';
import { ComboCategory } from './ComboCategory';

export type ComboLibraryData = {
    categories: ComboCategory[];
};

export class ComboLibrary {
    public data?: ComboLibraryData;

    constructor(data: ComboLibraryData) {
        this.data = data;
    }

    public flatten() {
        if (!this.data) return [];

        const data: ComboLibraryElement<any>[] = [];

        for (const category of this.data.categories) {
            if (!category.data!.combos.length) continue;

            data.push(category);

            for (const combo of category.data!.combos) {
                data.push(combo);
            }
        }

        return data;
    }
}
