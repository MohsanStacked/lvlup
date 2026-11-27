export function createWorkerStore({ DB, BUCKET }) {
  const list = async (query) => (await DB.prepare(query).all()).results.map(({ body }) => JSON.parse(body));
  return {
    saveEnquiry: (value) => DB.prepare('INSERT INTO enquiries (reference, received_at, body) VALUES (?, ?, ?)').bind(value.reference, value.receivedAt, JSON.stringify(value)).run(),
    listEnquiries: () => list('SELECT body FROM enquiries ORDER BY received_at DESC LIMIT 250'),
    saveMedia: (value) => DB.prepare('INSERT INTO media (id, body) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET body=excluded.body').bind(value.id, JSON.stringify(value)).run(),
    listMedia: () => list('SELECT body FROM media ORDER BY created_at DESC, id DESC'),
    removeMedia: (id) => DB.prepare('DELETE FROM media WHERE id = ?').bind(id).run(),
    saveFile: (name, bytes, type) => BUCKET.put(name, bytes, { httpMetadata: { contentType: type } }),
    async getFile(name) {
      const object = await BUCKET.get(name);
      return object ? { bytes: new Uint8Array(await object.arrayBuffer()), type: object.httpMetadata?.contentType ?? 'application/octet-stream' } : null;
    },
  };
}
