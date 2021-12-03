import * as docs from '@googleapis/docs';

export type TextElement = {
    text: string;
    bold?: boolean;
    underline?: boolean;
    link?: string;
};

export class DocElement {
    public elements: TextElement[];
    public headingId?: string;
    public style?: string;
    public bullet?: string;

    constructor(elements: TextElement[]) {
        this.elements = elements;
    }

    public get rawText() {
        const text = this.elements.reduce((val, cur) => {
            return val + cur.text;
        }, '');

        return text;
    }

    public toMarkdown() {
        const text = this.elements.reduce((val, cur) => {
            let text = cur.text;
            if (cur.bold) text = `**${text}**`;

            if (cur.underline && !cur.link) text = `__${text}__`;

            if (cur.link) text = `[${text}](${cur.link})`;

            return val + text;
        }, '');

        if (this.bullet) {
            return `${this.bullet} ${text}`;
        }

        return text;
    }
}

export class DocParser {
    private apiClient?: docs.docs_v1.Docs;
    protected documentId: string;

    constructor(documentId: string) {
        this.documentId = documentId;
    }

    private async init() {
        console.log('Initializing doc parser');
        const auth = new docs.auth.GoogleAuth({
            keyFilename: 'google-api-credentials.json',
            scopes: ['https://www.googleapis.com/auth/documents'],
        });

        const authClient = await auth.getClient();

        const client = docs.docs({
            version: 'v1',
            auth: authClient,
        });

        this.apiClient = client;

        return client;
    }

    private async fetchDocument() {
        const client = this.apiClient || (await this.init());

        console.log(`Fetching document with id '${this.documentId}'`);
        const res = await client.documents.get({
            documentId: this.documentId,
        });

        return res.data;
    }

    public async parseDoc() {
        const doc = await this.fetchDocument();
        console.log('Parsing document...');
        // console.log(doc);

        const content = doc.body?.content;
        if (!content) return;

        const lists = doc.lists;

        // console.log(JSON.stringify(lists, null, 2));

        const listIndexes: {
            [s: string]: number;
        } = {};

        const docElements: DocElement[] = [];

        // loop over the document content
        for (let i = 0; i < content.length; i++) {
            const element = content[i];

            // skip if the element has no content
            if (!element.paragraph?.elements) continue;

            // convert paragraph content to an array of TextElement objects
            let elements = element.paragraph.elements.reduce((acc: TextElement[], cur, i, arr) => {
                let textContent = cur.textRun?.content;
                // console.log(cur);

                if (!textContent) return acc;

                textContent = textContent.replace(/\n$/g, '');
                // console.log('textContent', `"${textContent}"`);

                const newVal: TextElement = {
                    text: textContent,
                };

                const textStyle = cur.textRun?.textStyle;
                if (textStyle) {
                    if (textStyle.bold) newVal.bold = true;
                    if (textStyle.underline) newVal.underline = true;
                    if (textStyle.link && textStyle.link.url) newVal.link = textStyle.link.url;
                }

                return [...acc, newVal];
            }, []);

            if (!elements.length) continue;

            if (elements.some((e) => e.text !== '')) {
                elements = elements.filter((e) => e.text !== '');
            } else {
                elements = [{ text: '' }];
            }

            const data = new DocElement(elements);

            // Find paragraph style
            const paragraphStyle = element.paragraph.paragraphStyle?.namedStyleType;
            // console.log(element.paragraph);

            if (paragraphStyle) {
                data.style = paragraphStyle;
            }
            const headingId = element.paragraph.paragraphStyle?.headingId;
            if (headingId) {
                data.headingId = headingId;
            }

            // detect if the item is a list item and add the correct bullet style
            const bulletListId = element.paragraph.bullet?.listId;
            if (lists && bulletListId) {
                const bulletStyle = lists[bulletListId].listProperties?.nestingLevels![0];
                // console.log(bulletStyle);

                if (bulletStyle) {
                    if (bulletStyle.glyphSymbol) {
                        data.bullet = bulletStyle.glyphSymbol;
                    } else if (bulletStyle.glyphType === 'DECIMAL' && typeof bulletStyle.startNumber === 'number') {
                        // if not first item in the current list
                        if (typeof listIndexes[bulletListId] === 'number') {
                            listIndexes[bulletListId]++;
                        } else {
                            listIndexes[bulletListId] = bulletStyle.startNumber;
                        }

                        data.bullet = `${listIndexes[bulletListId]}.`;
                    }
                }
            }

            docElements.push(data);
        }

        return docElements;
    }
}
