import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { figmaArtworks } from './dist/figma-data.js';

const project = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(project, 'dist');
const output = path.resolve(process.argv[2] ?? path.join(project, 'Fashion-House.html'));
const types = { '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp', '.svg':'image/svg+xml', '.woff2':'font/woff2' };
const read = file => readFileSync(file, 'utf8');
const dataUrl = file => {
  const type = types[path.extname(file).toLowerCase()];
  if (!type) throw new Error(`No embedded asset type for ${file}`);
  return `data:${type};base64,${readFileSync(file).toString('base64')}`;
};

const assets = new Set(figmaArtworks.flatMap(art => [art.image, art.avatar]).filter(Boolean).map(src => {
  if (!src.startsWith('./assets/')) throw new Error(`Gallery asset must be local: ${src}`);
  return src.slice('./assets/'.length);
}));
const modules = new Map();
const jsImport = /^import\s+\{([^}]+)\}\s+from\s+['"](\.\/[^'"]+)['"];\s*$/gm;
const jsExport = /^export\s+(?=(?:async\s+)?(?:function|const|let|class)\s+([\w$]+))/gm;

function collect(file) {
  if (modules.has(file)) return;
  const name = path.relative(dist, file).replaceAll(path.sep, '/');
  const source = read(file);
  const dependencies = [...source.matchAll(jsImport)];
  for (const [, , specifier] of dependencies) collect(path.resolve(path.dirname(file), specifier));
  for (const [, asset] of source.matchAll(/\bstaticAsset\(['"]([^'"]+)['"]\)/g)) assets.add(asset);
  const exports = [...source.matchAll(jsExport)].map(([, binding]) => binding);
  const body = source.replace(jsImport, (_, imports, specifier) => {
    const dependency = path.relative(dist, path.resolve(path.dirname(file), specifier)).replaceAll(path.sep, '/');
    return `const {${imports.replace(/\s+as\s+/g, ': ')}} = __modules[${JSON.stringify(dependency)}];\n`;
  }).replace(jsExport, '');
  if (/^\s*(?:import|export)\s/m.test(body)) throw new Error(`Unsupported module syntax in ${name}`);
  modules.set(file, { name, body, exports });
}
collect(path.join(dist, 'app.js'));

const assetsDir = path.join(dist, 'assets');
const assetTable = Object.fromEntries([...assets].sort().map(name => [name, dataUrl(path.join(assetsDir, name))]));
const bundle = [...modules.values()].map(({name, body, exports}) => {
  if (name === 'asset-url.js') {
    return `__modules[${JSON.stringify(name)}] = { staticAsset(name) {\n  if (!Object.hasOwn(__assets, name)) throw new Error('Missing embedded asset: ' + name);\n  return __assets[name];\n} };`;
  }
  return `// ${name}\n__modules[${JSON.stringify(name)}] = await (async () => {\n${body}\nreturn { ${exports.join(', ')} };\n})();`;
}).join('\n\n');
const script = `(async () => {\n'use strict';\nconst __modules = Object.create(null);\nconst __assets = ${JSON.stringify(assetTable)};\n${bundle}\n})().catch(error => {\nconsole.error(error);\nconst app = document.getElementById('app');\nif (app && !app.hasChildNodes()) app.textContent = 'Fashion House could not start. Open this HTML file in Chrome or Edge.';\n});`;
const fontNotices = ['abrilfatface', 'outfit', 'spacemono'].map(name => read(path.join(assetsDir, 'fonts', `${name}-OFL.txt`))).join('\n\n');

const html = read(path.join(dist, 'index.html'))
  .replace(/<link rel="stylesheet" href="(\.\/[^"\n]+)">/g, (_, href) => {
    const file = path.resolve(dist, href);
    const css = read(file).replace(/url\(\s*(['"]?)(\.\/[^'"\s)]+)\1\s*\)/g, (_, quote, src) => `url("${dataUrl(path.resolve(path.dirname(file), src))}")`);
    return `<style>\n${css}\n</style>`;
  })
  .replace('href="./assets/favicon.svg"', `href="${dataUrl(path.join(assetsDir, 'favicon.svg'))}"`)
  .replace('<script type="module" src="./app.js"></script>', () => `<script>\n${script.replace(/<\/script/gi, '<\\/script')}\n</script>\n  <script type="text/plain" id="font-license-notices">\n${fontNotices}\n</script>`);

if (/<script[^>]*\bsrc=|<link[^>]*href="\.\//i.test(html)) throw new Error('The export still references external site files.');
writeFileSync(output, html);
console.log(`${output} (${(Buffer.byteLength(html) / 1024 / 1024).toFixed(1)} MiB, ${assets.size} embedded image assets)`);
