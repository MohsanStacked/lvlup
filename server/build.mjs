import { build } from 'esbuild';
import { cp, mkdir, readFile, readdir, rm } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const dist = 'dist';
const template = await readFile(join(dist, 'index.html'), 'utf8');
await build({
  entryPoints: ['src/render.tsx'], bundle: true, platform: 'node', format: 'esm', jsx: 'automatic',
  packages: 'external', outfile: 'dist/render.mjs', logLevel: 'warning',
});
const types = { '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.woff': 'font/woff', '.woff2': 'font/woff2' };
const assets = {};
const escape = (value) => value.replace(/[<>&"']/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' })[char]);
const { renderPages } = await import(pathToFileURL(join(process.cwd(), dist, 'render.mjs')).href);
for (const { path, title, description, content } of renderPages()) {
  const extra = path === '/studio' || path === '/404' ? '<meta name="robots" content="noindex" />' : '';
  const html = template
    .replace(/<title>.*?<\/title>/, () => '<title>' + escape(title) + ' | LVLUP RETREATS</title>' + extra)
    .replace(/(<meta name="description" content=")[^"]*/, (_, prefix) => prefix + escape(description))
    .replace('<div id="root"></div>', () => '<div id="root">' + content + '</div>');
  assets[path] = ['text/html; charset=utf-8', Buffer.from(html).toString('base64'), path === '/404' ? 404 : 200];
}
await rm(join(dist, 'render.mjs'));

async function addFiles(directory) {
  for (const entry of await readdir(join(dist, directory), { withFileTypes: true })) {
    const name = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!entry.name.startsWith('.')) await addFiles(name);
    } else if (types[extname(name)]) {
      assets['/' + name] = [types[extname(name)], (await readFile(join(dist, name))).toString('base64')];
    }
  }
}

await addFiles('');
const assetPlugin = {
  name: 'lvlup-static',
  setup(builder) {
    builder.onResolve({ filter: /^virtual:lvlup-static$/ }, () => ({ path: 'assets', namespace: 'lvlup' }));
    builder.onLoad({ filter: /^assets$/, namespace: 'lvlup' }, () => ({ contents: 'export default ' + JSON.stringify(assets), loader: 'js' }));
  },
};
await build({ entryPoints: ['server/worker.mjs'], outfile: 'dist/server/index.js', bundle: true, format: 'esm', minify: true, plugins: [assetPlugin] });
await build({ entryPoints: ['server/local-app.mjs'], outfile: 'dist/local/index.mjs', bundle: true, format: 'esm', platform: 'node', plugins: [assetPlugin] });
await mkdir('dist/.openai', { recursive: true });
await cp('.openai/hosting.json', 'dist/.openai/hosting.json');
await cp('drizzle', 'dist/.openai/drizzle', { recursive: true });
