import { fuzzySearch } from "../GenshinData";
import { Combo, ComboData } from "./ComboLibrary/Combo";
import { ComboCategory, ComboCategoryData } from "./ComboLibrary/ComboCategory";
import { ComboLibrary, ComboLibraryData } from "./ComboLibrary/ComboLibrary";
import { DocElement, DocumentParser } from "./DocumentParser";

export type ComboField = {
  name: string;
  value: DocElement[];
};

const documentId = process.env.DOCUMENT_ID;
if (!documentId) {
  throw Error("DOCUMENT_ID not specified");
}
const docParser = new DocumentParser(documentId);

function parseComboLibrary(elements: DocElement[]) {
  const comboLibrary: ComboLibraryData = {
    categories: [],
  };

  let combosStarted = false;

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i]!;

    if (
      !combosStarted &&
      element.style === "HEADING_1" &&
      element.rawText === "Vaporize Combos"
    ) {
      combosStarted = true;
    }

    if (!combosStarted) continue;

    if (
      element.style === "HEADING_1" &&
      element.rawText.toLowerCase() === "how to submit a combo"
    ) {
      break;
    }

    // category title
    if (element.style === "HEADING_1" && element.rawText !== "") {
      const comboCategory: ComboCategoryData = {
        name: element.rawText,
        description: [],
        combos: [],
      };

      if (element.headingId) {
        comboCategory.headingId = element.headingId;
      }

      const desc = [];
      for (let j = i + 1; j < elements.length; j++) {
        const el = elements[j]!;

        // category desc
        if (el.style === "NORMAL_TEXT") {
          desc.push(el);
          continue;
        }

        break;
      }

      // remove empty lines from the start
      while (desc[0]?.rawText === "") {
        desc.shift();
      }

      // remove empty lines from the end
      while (desc[desc.length - 1]?.rawText === "") {
        desc.pop();
      }

      comboCategory.description = desc;

      comboLibrary.categories.push(new ComboCategory(comboCategory));
      continue;
    }

    // Combo
    if (element.style === "HEADING_2" && element.rawText !== "") {
      const combo: ComboData = {
        name: element.rawText,
        description: [],
        members: [],
        fields: [],
      };

      // Heading Id
      if (element.headingId) {
        combo.headingId = element.headingId;
      }

      // Combo Description
      const desc: DocElement[] = [];
      for (let j = i + 1; j < elements.length; j++) {
        const el = elements[j]!;

        // combo desc
        if (el.style === "NORMAL_TEXT") {
          const descLineText = el.rawText;
          // parse submitter
          if (descLineText.startsWith("Submitted by")) {
            combo.submittedBy = descLineText.replace("Submitted by ", "");
            continue;
          }

          desc.push(el);
          continue;
        }

        // Break loop when elements are no longer of style 'Normal text'
        break;
      }

      // Remove empty lines from the start and the end of the description
      while (desc[0]?.rawText === "") {
        desc.shift();
      }

      while (desc[desc.length - 1]?.rawText === "") {
        desc.pop();
      }

      combo.description = desc;

      // iterate over elements to find combo fields
      for (let j = i + 1; j < elements.length; j++) {
        const el = elements[j]!;

        // section header
        if (el.style === "HEADING_3") {
          const elText = el.rawText;
          if (elText === "") continue;

          const field: ComboField = {
            name: elText,
            value: [],
          };

          // section content
          for (let k = j + 1; k < elements.length; k++) {
            const el = elements[k]!;

            // field value
            if (el.style === "NORMAL_TEXT") {
              field.value.push(el);
              continue;
            }

            break;
          }

          // Parse combo members
          if (field.name === "Combo Requirements") {
            for (const charNameEl of field.value) {
              const charName = charNameEl.rawText.split("-")[0]!.trim();
              const char = fuzzySearch(charName);

              if (char) {
                combo.members.push(char);
              }
            }
          }

          // Remove empty lines from the start and the end of the description
          while (field.value[0]?.rawText === "") {
            field.value.shift();
          }
          while (field.value[field.value.length - 1]?.rawText === "") {
            field.value.pop();
          }

          combo.fields.push(field);
        }

        if (el.style !== "HEADING_3" && el.style !== "NORMAL_TEXT") break;
      }

      // console.log('fields', fields);

      comboLibrary.categories[
        comboLibrary.categories.length - 1
      ]?.data?.combos.push(new Combo(combo));
      continue;
    }
  }

  return new ComboLibrary(comboLibrary);
}

export async function getComboLibrary() {
  const elements = await docParser.parseDoc();
  if (!elements) return undefined;

  return parseComboLibrary(elements);
}
