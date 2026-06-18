import { spawnSync } from 'node:child_process';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const buildDirectory = path.join(repositoryRoot, '.mcpb-build');
const releaseDirectory = path.join(repositoryRoot, 'release');
const packageMetadata = JSON.parse(await readFile(path.join(repositoryRoot, 'package.json'), 'utf8'));
const manifest = JSON.parse(await readFile(path.join(repositoryRoot, 'mcpb', 'manifest.json'), 'utf8'));

if (manifest.version !== packageMetadata.version) {
  throw new Error(`MCPB manifest version ${manifest.version} does not match package version ${packageMetadata.version}.`);
}

function run(command, argumentsList, workingDirectory) {
  const result = spawnSync(command, argumentsList, {
    cwd: workingDirectory,
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    throw new Error(`${command} ${argumentsList.join(' ')} failed with exit code ${result.status}.`);
  }
}

await rm(buildDirectory, { force: true, recursive: true });
await mkdir(path.join(buildDirectory, 'assets'), { recursive: true });
await mkdir(releaseDirectory, { recursive: true });

await Promise.all([
  cp(path.join(repositoryRoot, 'dist'), path.join(buildDirectory, 'dist'), { recursive: true }),
  cp(path.join(repositoryRoot, 'mcpb', 'assets', 'icon.png'), path.join(buildDirectory, 'assets', 'icon.png')),
  cp(path.join(repositoryRoot, 'LICENSE'), path.join(buildDirectory, 'LICENSE')),
  cp(path.join(repositoryRoot, 'README.md'), path.join(buildDirectory, 'README.md')),
  cp(path.join(repositoryRoot, 'package-lock.json'), path.join(buildDirectory, 'package-lock.json')),
  cp(path.join(repositoryRoot, 'package.json'), path.join(buildDirectory, 'package.json')),
  writeFile(path.join(buildDirectory, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`),
]);

run('npm', ['ci', '--omit=dev'], buildDirectory);

const outputPath = path.join(
  releaseDirectory,
  `openfate-bazi-mcp-v${packageMetadata.version}.mcpb`,
);

await rm(outputPath, { force: true });
run(
  'npx',
  ['--yes', '@anthropic-ai/mcpb@2.1.2', 'pack', buildDirectory, outputPath],
  repositoryRoot,
);

console.log(`MCPB bundle created: ${outputPath}`);
