import { createServer } from 'node:http';
import { Readable } from 'node:stream';
import { resolve } from 'node:path';
import { createLocalApp } from '../dist/local/index.mjs';

const port = Number(process.env.PORT ?? '4173');
const handler = createLocalApp(resolve(process.env.LVLUP_DATA_DIR ?? '.lvlup-data'), process.env.STUDIO_ACCESS_TOKEN);
const server = createServer(async (incoming, outgoing) => {
  try {
    const hasBody = incoming.method !== 'GET' && incoming.method !== 'HEAD';
    const request = new Request('http://127.0.0.1:' + port + incoming.url, {
      method: incoming.method, headers: incoming.headers,
      ...(hasBody ? { body: Readable.toWeb(incoming), duplex: 'half' } : {}),
    });
    const response = await handler(request);
    outgoing.writeHead(response.status, Object.fromEntries(response.headers));
    if (response.body) Readable.fromWeb(response.body).pipe(outgoing);
    else outgoing.end();
  } catch {
    outgoing.writeHead(500);
    outgoing.end('Something went wrong.');
  }
});

server.listen(port, '127.0.0.1', () => console.log('Local: http://127.0.0.1:' + port));
