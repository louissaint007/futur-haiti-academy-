import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const modules = [
  { id: 'geologie-futur-haiti', base: '/apps/geologie-futur-haiti/', localRoots: ['models', 'references', 'textures', 'draco', 'deep-time'] },
  { id: 'systeme-solaire-futur-haiti', base: '/apps/systeme-solaire-futur-haiti/', localRoots: ['nasa'] },
  { id: 'chimie-futur-haiti', base: '/apps/chimie-futur-haiti/', localRoots: [] },
  { id: 'histoire-futur-haiti', base: '/apps/histoire-futur-haiti/', localRoots: [] },
];
for (const module of modules) {
  const moduleRoot = path.join(root, 'modules', module.id);
  const pkg = JSON.parse(await readFile(path.join(moduleRoot, 'package.json'), 'utf8'));
  const vite = pkg.dependencies?.vite || pkg.devDependencies?.vite;
  if (!vite) throw new Error(`Vite est absent de modules/${module.id}/package.json`);

  for (const rootName of module.localRoots) {
    const sourceRoot = path.join(moduleRoot, 'src');
    await rewriteRootAssetPaths(sourceRoot, rootName, module.base);
  }

  const require = createRequire(path.join(moduleRoot, 'package.json'));
  const viteEntry = require.resolve('vite');
  const viteRoot = path.resolve(path.dirname(viteEntry), '..', '..');
  const viteCli = path.join(viteRoot, 'bin', 'vite.js');
  const outputRelative = path.relative(moduleRoot, path.join(root, 'public', 'apps', module.id));
  const result = spawnSync(process.execPath, [viteCli, 'build', `--base=${module.base}`, `--outDir=${outputRelative}`, '--emptyOutDir'], { cwd: moduleRoot, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`Compilation échouée : ${module.id} (code ${result.status})`);
  console.log(`Module prêt : ${module.id}`);
}

await mkdir(path.join(root, 'dist'), { recursive: true });
await cp(path.join(root, 'index.html'), path.join(root, 'dist', 'index.html'));
await cp(path.join(root, 'src', 'styles.css'), path.join(root, 'dist', 'styles.css'));
await cp(path.join(root, 'src'), path.join(root, 'dist', 'src'), { recursive: true });
await cp(path.join(root, 'public', 'apps'), path.join(root, 'dist', 'apps'), { recursive: true });
console.log('Académie compilée dans dist/.');

async function rewriteRootAssetPaths(directory, assetRoot, base) {
  const entries = await import('node:fs/promises').then(({ readdir }) => readdir(directory, { withFileTypes: true }));
  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await rewriteRootAssetPaths(target, assetRoot, base);
    } else if (/\.(jsx?|tsx?|css|json)$/.test(entry.name)) {
      const original = await readFile(target, 'utf8');
      const rewritten = original.replaceAll(`/${assetRoot}/`, `${base}${assetRoot}/`);
      if (rewritten !== original) await writeFile(target, rewritten, 'utf8');
    }
  }
}
