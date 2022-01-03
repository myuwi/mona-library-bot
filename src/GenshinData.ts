export type Element = {
    name: string;
};

export type ElementsType = {
    [t in string]: Element;
};

export const Elements: ElementsType = {
    ANEMO: {
        name: 'Anemo',
    },
    CRYO: {
        name: 'Cryo',
    },
    DENDRO: {
        name: 'Dendro',
    },
    ELECTRO: {
        name: 'Electro',
    },
    GEO: {
        name: 'Geo',
    },
    HYDRO: {
        name: 'Hydro',
    },
    Pyro: {
        name: 'Pyro',
    },
} as const;

export type Character = {
    name: string;
    displayName?: string;
    aliases?: string[];
    rarity: number;
};

// Last updated for 2.3
export const Characters: Character[] = [
    {
        name: 'Aether',
        rarity: 5,
    },
    {
        name: 'Albedo',
        rarity: 5,
    },
    {
        name: 'Aloy',
        rarity: 5,
    },
    {
        name: 'Amber',
        rarity: 4,
    },
    {
        name: 'Arataki Itto',
        displayName: 'Itto',
        rarity: 5,
    },
    {
        name: 'Barbara',
        rarity: 4,
    },
    {
        name: 'Beidou',
        rarity: 4,
    },
    {
        name: 'Bennett',
        rarity: 4,
    },
    {
        name: 'Tartaglia',
        aliases: ['Childe'],
        rarity: 5,
    },
    {
        name: 'Chongyun',
        rarity: 4,
    },
    {
        name: 'Diluc',
        rarity: 5,
    },
    {
        name: 'Diona',
        rarity: 4,
    },
    {
        name: 'Eula',
        rarity: 5,
    },
    {
        name: 'Fischl',
        rarity: 4,
    },
    {
        name: 'Ganyu',
        rarity: 5,
    },
    {
        name: 'Gorou',
        rarity: 4,
    },
    {
        name: 'Hu Tao',
        rarity: 5,
    },
    {
        name: 'Jean',
        rarity: 5,
    },
    {
        name: 'Kaedehara Kazuha',
        displayName: 'Kazuha',
        rarity: 5,
    },
    {
        name: 'Kaeya',
        rarity: 4,
    },
    {
        name: 'Kamisato Ayaka',
        displayName: 'Ayaka',
        rarity: 5,
    },
    {
        name: 'Keqing',
        rarity: 5,
    },
    {
        name: 'Klee',
        rarity: 5,
    },
    {
        name: 'Kujou Sara',
        aliases: ['Sara'],
        rarity: 4,
    },
    {
        name: 'Lisa',
        rarity: 4,
    },
    {
        name: 'Lumine',
        rarity: 5,
    },
    {
        name: 'Mona',
        rarity: 5,
    },
    {
        name: 'Ningguang',
        rarity: 4,
    },
    {
        name: 'Noelle',
        rarity: 4,
    },
    {
        name: 'Qiqi',
        rarity: 5,
    },
    {
        name: 'Raiden Shogun',
        displayName: 'Raiden',
        rarity: 5,
    },
    {
        name: 'Razor',
        rarity: 4,
    },
    {
        name: 'Rosaria',
        rarity: 4,
    },
    {
        name: 'Sangonomiya Kokomi',
        displayName: 'Kokomi',
        rarity: 5,
    },
    {
        name: 'Sayu',
        rarity: 4,
    },
    {
        name: 'Sucrose',
        rarity: 4,
    },
    {
        name: 'Thoma',
        rarity: 4,
    },
    {
        name: 'Traveler',
        rarity: 5,
    },
    {
        name: 'Venti',
        rarity: 5,
    },
    {
        name: 'Xiangling',
        rarity: 4,
    },
    {
        name: 'Xiao',
        rarity: 5,
    },
    {
        name: 'Xingqiu',
        rarity: 4,
    },
    {
        name: 'Xinyan',
        rarity: 4,
    },
    {
        name: 'Yanfei',
        rarity: 4,
    },
    {
        name: 'Yoimiya',
        rarity: 5,
    },
    {
        name: 'Zhongli',
        rarity: 5,
    },
];

export const getCharacterFileName = (char: Character) => char.name.replace(' ', '_');

export type ParseCharacterOptions = {
    throwOnNotFound?: boolean;
};

export const resolveCharacter = (characterName: string, options: ParseCharacterOptions = {}) => {
    const opts: Required<ParseCharacterOptions> = {
        throwOnNotFound: options.throwOnNotFound ?? false,
    };

    const charName = characterName.toUpperCase().replace(' ', '');

    for (let j = 0; j < Characters.length; j++) {
        const char = Characters[j];

        if (
            charName.startsWith(char.name.toUpperCase().replace(' ', '')) ||
            (char.displayName && charName.startsWith(char.displayName.toUpperCase().replace(' ', ''))) ||
            (char.aliases && char.aliases.some((alias) => charName.startsWith(alias.toUpperCase().replace(' ', ''))))
        ) {
            return char;
        }
    }

    if (opts.throwOnNotFound) throw new Error(`Character was not found with string: "${characterName}"`);

    return null;
};

export const resolveElement = (elementName: string) => {
    const element = elementName.toUpperCase();

    const elements = Object.values(Elements);

    for (let j = 0; j < elements.length; j++) {
        const el = elements[j];

        if (element.startsWith(el.name.toUpperCase())) {
            return el;
        }
    }

    return null;
};

export const parseCharacters = (characters: string[]) => {
    const _characters: Character[] = [];

    for (let i = 0; i < characters.length; i++) {
        const charName = characters[i];
        const char = resolveCharacter(charName);
        if (char) _characters.push(char);
    }

    return _characters;
};

export const parseTeam = (members: string[], throwOnNotFound = false) => {
    const output: (Element | Character)[] = [];
    const invalid: string[] = [];

    for (let i = 0; i < members.length; i++) {
        const name = members[i];

        const char = resolveCharacter(name);
        if (char) {
            output.push(char);
            continue;
        }

        const element = resolveElement(name);
        if (element) {
            output.push(element);
            continue;
        }

        invalid.push(name);
    }

    if (throwOnNotFound && invalid.length) {
        throw new Error('Unable to parse characters: ' + invalid.join(', '));
    }

    return output;
};
