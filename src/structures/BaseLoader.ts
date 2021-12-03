import { promises as fs } from 'fs';
import * as path from 'path';
import { __rootdir__ } from '../root';

export class BaseLoader {
    protected async readdirRecursive(directory: string) {
        const result: string[] = [];

        const read = async (dir: string) => {
            const files = await fs.readdir(dir);

            for (const file of files) {
                const filePath = path.join(dir, file);

                if ((await fs.stat(filePath)).isDirectory()) {
                    await read(filePath);
                } else {
                    result.push(filePath);
                }
            }
        };

        await read(path.join(directory));
        return result;
    }
}
