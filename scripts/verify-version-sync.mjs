import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

async function readJson(relativePath) {
  const filePath = path.join(repositoryRoot, relativePath);
  return JSON.parse(await readFile(filePath, 'utf8'));
}

const packageMetadata = await readJson('package.json');
const packageLock = await readJson('package-lock.json');
const serverMetadata = await readJson('server.json');
const mcpbManifest = await readJson('mcpb/manifest.json');

const expected = packageMetadata.version;
const mismatches = [];

if (packageLock.version !== expected) {
  mismatches.push(`package-lock.json version is ${packageLock.version}, expected ${expected}`);
}

const lockRootVersion = packageLock.packages?.['']?.version;
if (lockRootVersion !== expected) {
  mismatches.push(`package-lock.json packages[\"\"].version is ${lockRootVersion}, expected ${expected}`);
}

if (serverMetadata.version !== expected) {
  mismatches.push(`server.json version is ${serverMetadata.version}, expected ${expected}`);
}

const serverPackageEntry = serverMetadata.packages?.find(
  (entry) => entry.identifier === packageMetadata.name,
);
if (serverPackageEntry && serverPackageEntry.version !== expected) {
  mismatches.push(`server.json packages[].version is ${serverPackageEntry.version}, expected ${expected}`);
}

if (mcpbManifest.version !== expected) {
  mismatches.push(`mcpb/manifest.json version is ${mcpbManifest.version}, expected ${expected}`);
}

if (mismatches.length > 0) {
  throw new Error(
    `Version sync check failed against package.json@${expected}:\n  - ${mismatches.join('\n  - ')}`,
  );
}

console.log(`Version sync OK: package.json, package-lock.json, server.json, and mcpb/manifest.json all at ${expected}.`);
