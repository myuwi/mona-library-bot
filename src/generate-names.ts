import sharp from 'sharp';
import { Character, Characters, Element, Elements, getCharacterFileName } from './GenshinData';

(async () => {
  const data: (Element | Character)[] = [
    {
      name: 'Empty',
      displayName: '--',
      rarity: 1,
    },
    ...Characters,
    ...Elements,
  ];

  data.forEach(async (el) => {
    console.log(`Generating name file for: ${el.name}`);
    const name = ('displayName' in el && el.displayName) || el.name;

    const svgImage = `
    <svg width="256" height="56">
      <style>
      text {
        fill: #4f4e57;
        font-family: "TT_Skip-E";
        font-weight: heavy;
        font-size: 36px;
      }
      </style>
      <text x="50%" y="39" text-anchor="middle">${name}</text>
    </svg>
    `;

    const svgBuffer = Buffer.from(svgImage);
    const fileName = 'rarity' in el ? getCharacterFileName(el) : el.name;
    const filePath = `./assets/names/${fileName}.png`;
    const image = await sharp(svgBuffer).toFile(filePath);

    console.log(`Generated name file for: ${fileName}`);
  });
})();
