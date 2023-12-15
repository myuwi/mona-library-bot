import Fuse from "fuse.js";

export type Element = {
  name: string;
};

export const Elements = [
  {
    name: "Anemo",
  },
  {
    name: "Cryo",
  },
  {
    name: "Dendro",
  },
  {
    name: "Electro",
  },
  {
    name: "Geo",
  },
  {
    name: "Hydro",
  },
  {
    name: "Pyro",
  },
] as const satisfies Readonly<Element[]>;

export type Character = {
  name: string;
  displayName?: string;
  aliases?: Readonly<string[]>;
  rarity: number;
};

export const Characters = [
  {
    name: "Aether",
    rarity: 5,
  },
  {
    name: "Albedo",
    rarity: 5,
  },
  {
    name: "Alhaitham",
    rarity: 5,
  },
  {
    name: "Aloy",
    rarity: 5,
  },
  {
    name: "Amber",
    rarity: 4,
  },
  {
    name: "Arataki Itto",
    displayName: "Itto",
    rarity: 5,
  },
  {
    name: "Baizhu",
    rarity: 5,
  },
  {
    name: "Barbara",
    rarity: 4,
  },
  {
    name: "Beidou",
    rarity: 4,
  },
  {
    name: "Bennett",
    rarity: 4,
  },
  {
    name: "Candace",
    rarity: 4,
  },
  {
    name: "Charlotte",
    rarity: 4,
  },
  {
    name: "Chevreuse",
    rarity: 4,
  },
  {
    name: "Chongyun",
    rarity: 4,
  },
  {
    name: "Collei",
    rarity: 4,
  },
  {
    name: "Cyno",
    rarity: 5,
  },
  {
    name: "Dehya",
    rarity: 5,
  },
  {
    name: "Diluc",
    rarity: 5,
  },
  {
    name: "Diona",
    rarity: 4,
  },
  {
    name: "Dori",
    rarity: 4,
  },
  {
    name: "Eula",
    rarity: 5,
  },
  {
    name: "Faruzan",
    rarity: 4,
  },
  {
    name: "Fischl",
    rarity: 4,
  },
  {
    name: "Freminet",
    rarity: 4,
  },
  {
    name: "Furina",
    rarity: 5,
  },
  {
    name: "Ganyu",
    rarity: 5,
  },
  {
    name: "Gorou",
    rarity: 4,
  },
  {
    name: "Hu Tao",
    rarity: 5,
  },
  {
    name: "Jean",
    rarity: 5,
  },
  {
    name: "Kaedehara Kazuha",
    displayName: "Kazuha",
    rarity: 5,
  },
  {
    name: "Kaeya",
    rarity: 4,
  },
  {
    name: "Kamisato Ayaka",
    displayName: "Ayaka",
    rarity: 5,
  },
  {
    name: "Kamisato Ayato",
    displayName: "Ayato",
    rarity: 5,
  },
  {
    name: "Kaveh",
    rarity: 4,
  },
  {
    name: "Keqing",
    rarity: 5,
  },
  {
    name: "Kirara",
    rarity: 4,
  },
  {
    name: "Klee",
    rarity: 5,
  },
  {
    name: "Kujou Sara",
    rarity: 4,
  },
  {
    name: "Kuki Shinobu",
    displayName: "Shinobu",
    rarity: 4,
  },
  {
    name: "Layla",
    rarity: 4,
  },
  {
    name: "Lisa",
    rarity: 4,
  },
  {
    name: "Lumine",
    rarity: 5,
  },
  {
    name: "Lynette",
    rarity: 4,
  },
  {
    name: "Lyney",
    rarity: 5,
  },
  {
    name: "Mika",
    rarity: 4,
  },
  {
    name: "Mona",
    rarity: 5,
  },
  {
    name: "Nahida",
    rarity: 5,
  },
  {
    name: "Navia",
    rarity: 5,
  },
  {
    name: "Neuvillette",
    rarity: 5,
  },
  {
    name: "Nilou",
    rarity: 5,
  },
  {
    name: "Ningguang",
    rarity: 4,
  },
  {
    name: "Noelle",
    rarity: 4,
  },
  {
    name: "Qiqi",
    rarity: 5,
  },
  {
    name: "Raiden Shogun",
    displayName: "Raiden",
    rarity: 5,
  },
  {
    name: "Razor",
    rarity: 4,
  },
  {
    name: "Rosaria",
    rarity: 4,
  },
  {
    name: "Sangonomiya Kokomi",
    displayName: "Kokomi",
    rarity: 5,
  },
  {
    name: "Sayu",
    rarity: 4,
  },
  {
    name: "Shenhe",
    rarity: 5,
  },
  {
    name: "Shikanoin Heizou",
    displayName: "Heizou",
    rarity: 4,
  },
  {
    name: "Sucrose",
    rarity: 4,
  },
  {
    name: "Tartaglia",
    aliases: ["Childe"],
    rarity: 5,
  },
  {
    name: "Thoma",
    rarity: 4,
  },
  {
    name: "Tighnari",
    rarity: 5,
  },
  {
    name: "Traveler",
    rarity: 5,
  },
  {
    name: "Venti",
    rarity: 5,
  },
  {
    name: "Wanderer",
    aliases: ["Scaramouche"],
    rarity: 5,
  },
  {
    name: "Wriothesley",
    rarity: 5,
  },
  {
    name: "Xiangling",
    rarity: 4,
  },
  {
    name: "Xiao",
    rarity: 5,
  },
  {
    name: "Xingqiu",
    rarity: 4,
  },
  {
    name: "Xinyan",
    rarity: 4,
  },
  {
    name: "Yae Miko",
    rarity: 5,
  },
  {
    name: "Yanfei",
    rarity: 4,
  },
  {
    name: "Yaoyao",
    rarity: 4,
  },
  {
    name: "Yelan",
    rarity: 5,
  },
  {
    name: "Yoimiya",
    rarity: 5,
  },
  {
    name: "Yun Jin",
    rarity: 4,
  },
  {
    name: "Zhongli",
    rarity: 5,
  },
] as const satisfies Readonly<Character[]>;

export type CharacterName = (typeof Characters)[number]["name"];

export const getCharacterByName = <T extends CharacterName>(
  characterName: T
): Character =>
  Characters.find(
    (c) =>
      c.name === characterName ||
      ("aliases" in c && c.aliases.some((a: string) => a === characterName))
  )!;

const fuse = new Fuse([...Characters, ...Elements], {
  includeScore: true,
  keys: ["name", "aliases"],
});

export const fuzzySearch = (query: string): Character | Element | undefined => {
  const res = fuse.search(query);

  if (!res[0] || (res[0].score && res[0].score > 0.5)) return undefined;

  return res[0].item;
};

export const getCharacterFileName = (char: Character) =>
  char.name.replace(" ", "_");

export const parseTeam = (members: string[]) => {
  const output: (Element | Character)[] = [];
  const invalid: string[] = [];

  for (const name of members) {
    const e = fuzzySearch(name);

    if (e) {
      output.push(e);
      continue;
    }

    invalid.push(name);
  }

  if (invalid.length) {
    throw new Error("Unable to parse characters: " + invalid.join(", "));
  }

  return output;
};
