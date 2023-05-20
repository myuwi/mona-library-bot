import { readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { promisify } from "node:util";

export const sleep = promisify(setTimeout);

export async function walk(dir: string): Promise<string[]> {
  const dirents = await readdir(dir, { withFileTypes: true });

  const files = await Promise.all(
    dirents.map((dirent) => {
      const fullPath = resolve(dir, dirent.name);
      return dirent.isDirectory() ? walk(fullPath) : fullPath;
    })
  );

  return files.flat();
}

export type FindOptions = {
  matching?: RegExp;
};

export async function find(
  dir: string,
  options?: FindOptions
): Promise<string[]> {
  return (await walk(dir)).filter(
    (file) => options?.matching?.test(file) ?? true
  );
}
