import childProcess from 'child_process';
import dotenv from 'dotenv';
import path from 'path';
import util from 'util';

import { db } from '../src/database/db';

const exec = util.promisify(childProcess.exec);

dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });

beforeAll(async () => {
  await exec('npx prisma db push --force-reset', {
    env: {
      ...process.env,
    },
  });
});

afterAll(async () => {
  await db.prisma.$disconnect();
});

describe('Database is empty', () => {
  test('getAll() should return empty array', async () => {
    await expect(db.guilds.getAll()).resolves.toHaveLength(0);
  });

  test('size() should return 0', async () => {
    await expect(db.guilds.size()).resolves.toEqual(0);
  });
});

describe('Database has data', () => {
  beforeAll(async () => {
    for (let i = 0; i < 100; i++) {
      await db.guilds.insert(i.toString());
    }
  });

  test('getAll() should return all guilds', async () => {
    await expect(db.guilds.getAll()).resolves.toHaveLength(100);
  });

  test('size() should return guild count', async () => {
    await expect(db.guilds.size()).resolves.toEqual(100);
  });
});

describe("Guild isn't in the database", () => {
  beforeAll(async () => {
    await db.prisma.guild.deleteMany();
  });

  test('get() should return null', async () => {
    await expect(db.guilds.get('0')).resolves.toBeNull();
  });

  it('insert() should insert guild', async () => {
    await db.guilds.insert('0');

    await expect(db.guilds.get('0')).resolves.toEqual({
      id: '0',
      prefix: null,
      syncChannelId: null,
      directoryChannelId: null,
    });
  });

  it('getOrInsert() should insert and get guild', async () => {
    await expect(db.guilds.getOrInsert('1')).resolves.toEqual({
      id: '1',
      prefix: null,
      syncChannelId: null,
      directoryChannelId: null,
    });
  });

  it('update() should throw', async () => {
    await expect(db.guilds.update('2', { prefix: '!' })).rejects.toEqual(new Error('Guild to update not found.'));
  });

  it('delete() should throw', async () => {
    await expect(db.guilds.delete('3')).rejects.toEqual(new Error("Unable to delete a guild that doesn't exist in the database."));
  });
});

describe('Guild is in the database', () => {
  beforeAll(async () => {
    await db.prisma.guild.deleteMany();
    await db.guilds.insert('1');
  });

  test('get() should return guild', async () => {
    await expect(db.guilds.get('1')).resolves.toEqual({
      id: '1',
      prefix: null,
      syncChannelId: null,
      directoryChannelId: null,
    });
  });

  it('insert() should throw', async () => {
    expect.assertions(1);
    await expect(db.guilds.insert('1')).rejects.toEqual(new Error('Guild already exists in the database.'));
  });

  it('getOrInsert() should return guild', async () => {
    await expect(db.guilds.getOrInsert('1')).resolves.toEqual({
      id: '1',
      prefix: null,
      syncChannelId: null,
      directoryChannelId: null,
    });
  });

  it('update() should update and return guild', async () => {
    await expect(db.guilds.update('1', { prefix: '!' })).resolves.toEqual({
      id: '1',
      prefix: '!',
      syncChannelId: null,
      directoryChannelId: null,
    });
  });

  it('delete() should delete guild', async () => {
    await expect(db.guilds.includes('1')).resolves.toEqual(true);
    await db.guilds.delete('1');
    await expect(db.guilds.includes('1')).resolves.toEqual(false);
  });
});
