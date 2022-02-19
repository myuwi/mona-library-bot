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
    aliases?: Readonly<string[]>;
    rarity: number;
};

// Last updated for 2.5
export const Characters: {
    [s: string]: Character;
} = {
    AETHER: {
        name: 'Aether',
        rarity: 5,
    },
    ALBEDO: {
        name: 'Albedo',
        rarity: 5,
    },
    ALOY: {
        name: 'Aloy',
        rarity: 5,
    },
    AMBER: {
        name: 'Amber',
        rarity: 4,
    },
    ARATAKI_ITTO: {
        name: 'Arataki Itto',
        displayName: 'Itto',
        rarity: 5,
    },
    BARBARA: {
        name: 'Barbara',
        rarity: 4,
    },
    BEIDOU: {
        name: 'Beidou',
        rarity: 4,
    },
    BENNETT: {
        name: 'Bennett',
        rarity: 4,
    },
    TARTAGLIA: {
        name: 'Tartaglia',
        aliases: ['Childe'],
        rarity: 5,
    },
    CHONGYUN: {
        name: 'Chongyun',
        rarity: 4,
    },
    DILUC: {
        name: 'Diluc',
        rarity: 5,
    },
    DIONA: {
        name: 'Diona',
        rarity: 4,
    },
    EULA: {
        name: 'Eula',
        rarity: 5,
    },
    FISCHL: {
        name: 'Fischl',
        rarity: 4,
    },
    GANYU: {
        name: 'Ganyu',
        rarity: 5,
    },
    GOROU: {
        name: 'Gorou',
        rarity: 4,
    },
    HU_TAO: {
        name: 'Hu Tao',
        rarity: 5,
    },
    JEAN: {
        name: 'Jean',
        rarity: 5,
    },
    KAEDEHARA_KAZUHA: {
        name: 'Kaedehara Kazuha',
        displayName: 'Kazuha',
        rarity: 5,
    },
    KAEYA: {
        name: 'Kaeya',
        rarity: 4,
    },
    KAMISATO_AYAKA: {
        name: 'Kamisato Ayaka',
        displayName: 'Ayaka',
        rarity: 5,
    },
    KEQING: {
        name: 'Keqing',
        rarity: 5,
    },
    KLEE: {
        name: 'Klee',
        rarity: 5,
    },
    KUJOU_SARA: {
        name: 'Kujou Sara',
        aliases: ['Sara'],
        rarity: 4,
    },
    LISA: {
        name: 'Lisa',
        rarity: 4,
    },
    LUMINE: {
        name: 'Lumine',
        rarity: 5,
    },
    MONA: {
        name: 'Mona',
        rarity: 5,
    },
    NINGGUANG: {
        name: 'Ningguang',
        rarity: 4,
    },
    NOELLE: {
        name: 'Noelle',
        rarity: 4,
    },
    QIQI: {
        name: 'Qiqi',
        rarity: 5,
    },
    RAIDEN_SHOGUN: {
        name: 'Raiden Shogun',
        displayName: 'Raiden',
        rarity: 5,
    },
    RAZOR: {
        name: 'Razor',
        rarity: 4,
    },
    ROSARIA: {
        name: 'Rosaria',
        rarity: 4,
    },
    SANGONOMIYA_KOKOMI: {
        name: 'Sangonomiya Kokomi',
        displayName: 'Kokomi',
        rarity: 5,
    },
    SAYU: {
        name: 'Sayu',
        rarity: 4,
    },
    SHENHE: {
        name: 'Shenhe',
        rarity: 5,
    },
    SUCROSE: {
        name: 'Sucrose',
        rarity: 4,
    },
    THOMA: {
        name: 'Thoma',
        rarity: 4,
    },
    TRAVELER: {
        name: 'Traveler',
        rarity: 5,
    },
    VENTI: {
        name: 'Venti',
        rarity: 5,
    },
    XIANGLING: {
        name: 'Xiangling',
        rarity: 4,
    },
    XIAO: {
        name: 'Xiao',
        rarity: 5,
    },
    XINGQIU: {
        name: 'Xingqiu',
        rarity: 4,
    },
    XINYAN: {
        name: 'Xinyan',
        rarity: 4,
    },
    YAE_MIKO: {
        name: 'Yae Miko',
        aliases: ['Yae'],
        rarity: 5,
    },
    YANFEI: {
        name: 'Yanfei',
        rarity: 4,
    },
    YOIMIYA: {
        name: 'Yoimiya',
        rarity: 5,
    },
    YUN_JIN: {
        name: 'Yun Jin',
        rarity: 4,
    },
    ZHONGLI: {
        name: 'Zhongli',
        rarity: 5,
    },
} as const;

export const getCharacterFileName = (char: Character) => char.name.replace(' ', '_');

export type ParseCharacterOptions = {
    throwOnNotFound?: boolean;
};

export const resolveCharacter = (characterName: string, options: ParseCharacterOptions = {}) => {
    const opts: Required<ParseCharacterOptions> = {
        throwOnNotFound: options.throwOnNotFound ?? false,
    };

    const charName = characterName.toUpperCase().replace(' ', '');

    const characters = Object.values(Characters);
    for (let j = 0; j < characters.length; j++) {
        const char = characters[j];
        // console.log(char);
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
