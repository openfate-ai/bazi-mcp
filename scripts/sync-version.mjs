#!/usr/bin/env node

/**
 * Synchronize every versioned MCP distribution manifest with package.json.
 * Runs from npm's `version` lifecycle after npm updates package.json/package-lock.json.
 */

/* Node */
import { readFile, writeFile } from 'node:fs/promises';

const repositoryRoot = new URL('../', import.meta.url);

async function readJson(relativePath) {
  return JSON.parse(await readFile(new URL(relativePath, repositoryRoot), 'utf8'));
}

async function writeJson(relativePath, value) {
  await writeFile(new URL(relativePath, repositoryRoot), `${JSON.stringify(value, null, 2)}\n`);
}

const packageMetadata = await readJson('package.json');
const serverMetadata = await readJson('server.json');
const mcpbManifest = await readJson('mcpb/manifest.json');

serverMetadata.version = packageMetadata.version;
for (const packageEntry of serverMetadata.packages) {
  if (packageEntry.identifier === packageMetadata.name) packageEntry.version = packageMetadata.version;
}
mcpbManifest.version = packageMetadata.version;

await Promise.all([
  writeJson('server.json', serverMetadata),
  writeJson('mcpb/manifest.json', mcpbManifest),
]);

console.log(`Synchronized MCP distribution metadata at ${packageMetadata.version}.`);
