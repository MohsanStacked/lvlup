import { mkdir, readdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export function createLocalStore(root) {
  function directory(collection) {
    return join(root, collection);
  }

  async function write(collection, name, data) {
    const dir = directory(collection);
    await mkdir(dir, { recursive: true, mode: 0o700 });
    const path = join(dir, name);
    const temp = path + '.' + crypto.randomUUID() + '.tmp';
    try {
      await writeFile(temp, data, { mode: 0o600 });
      await rename(temp, path);
    } finally {
      await rm(temp, { force: true });
    }
  }

  async function read(collection, name) {
    try {
      return await readFile(join(directory(collection), name));
    } catch (error) {
      if (error.code === 'ENOENT') return null;
      throw error;
    }
  }

  async function list(collection) {
    const names = await readdir(directory(collection)).catch((error) => {
      if (error.code === 'ENOENT') return [];
      throw error;
    });
    const values = await Promise.all(names.filter((entry) => entry.endsWith('.json')).map((name) => read(collection, name)));
    return values.filter(Boolean).map((value) => JSON.parse(value));
  }

  return {
    saveEnquiry: (value) => write('enquiries', value.reference + '.json', JSON.stringify(value)),
    listEnquiries: async () => (await list('enquiries')).sort((a, b) => b.receivedAt.localeCompare(a.receivedAt)).slice(0, 250),
    saveMedia: (value) => write('media', value.id + '.json', JSON.stringify(value)),
    listMedia: () => list('media'),
    removeMedia: (id) => rm(join(directory('media'), id + '.json'), { force: true }),
    async saveFile(name, bytes, type) {
      const encodedType = Buffer.from(type + '\n');
      await write('uploads', name, Buffer.concat([encodedType, bytes]));
    },
    async getFile(name) {
      const value = await read('uploads', name);
      if (!value) return null;
      const newline = value.indexOf(10);
      return { bytes: value.subarray(newline + 1), type: value.subarray(0, newline).toString('utf8') };
    },
  };
}
