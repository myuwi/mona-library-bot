import Fuse from 'fuse.js';

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
  CHONGYUN: {
    name: 'Chongyun',
    rarity: 4,
  },
  COLLEI: {
    name: 'Collei',
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
  DORI: {
    name: 'Dori',
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
  KAMISATO_AYATO: {
    name: 'Kamisato Ayato',
    displayName: 'Ayato',
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
    rarity: 4,
  },
  KUKI_SHINOBU: {
    name: 'Kuki Shinobu',
    displayName: 'Shinobu',
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
  SHIKANOIN_HEIZOU: {
    name: 'Shikanoin Heizou',
    displayName: 'Heizou',
    rarity: 4,
  },
  SUCROSE: {
    name: 'Sucrose',
    rarity: 4,
  },
  TARTAGLIA: {
    name: 'Tartaglia',
    aliases: ['Childe'],
    rarity: 5,
  },
  THOMA: {
    name: 'Thoma',
    rarity: 4,
  },
  TIGHNARI: {
    name: 'Tighnari',
    rarity: 5,
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
    rarity: 5,
  },
  YANFEI: {
    name: 'Yanfei',
    rarity: 4,
  },
  YELAN: {
    name: 'Yelan',
    rarity: 5,
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

const fuse = new Fuse([...Object.values(Characters), ...Object.values(Elements)], {
  includeScore: true,
  keys: ['name', 'aliases'],
});

export const fuzzySearch = (query: string, printResults = false): Character | Element | undefined => {
  const res = fuse.search(query);

  if (printResults) {
    console.log(res);
  }

  if (!res[0] || (res[0].score && res[0].score > 0.5)) return undefined;

  return res[0].item;
};

export const getCharacterFileName = (char: Character) => char.name.replace(' ', '_');

export const parseTeam = (members: string[], throwOnNotFound = false) => {
  const output: (Element | Character)[] = [];
  const invalid: string[] = [];

  for (let i = 0; i < members.length; i++) {
    const name = members[i];

    const e = fuzzySearch(name);

    if (e) {
      output.push(e);
      continue;
    }

    invalid.push(name);
  }

  if (throwOnNotFound && invalid.length) {
    throw new Error('Unable to parse characters: ' + invalid.join(', '));
  }

  return output;
};
