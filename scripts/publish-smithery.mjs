#!/usr/bin/env node

/* Node */
import { existsSync, readFileSync } from 'node:fs';
import { homedir, platform } from 'node:os';
import { join } from 'node:path';

/* MCP */
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const packageMetadata = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const qualifiedName = process.env.SMITHERY_SERVER_NAME ?? 'openfate-ai/bazi-mcp';
const bundlePath = new URL(`../release/openfate-bazi-mcp-v${packageMetadata.version}.mcpb`, import.meta.url);

function getSmitherySettingsPath() {
  if (process.env.SMITHERY_CONFIG_PATH) return process.env.SMITHERY_CONFIG_PATH;

  if (platform() === 'darwin') return join(homedir(), 'Library', 'Application Support', 'smithery', 'settings.json');
  if (platform() === 'win32') {
    return join(process.env.APPDATA ?? join(homedir(), 'AppData', 'Roaming'), 'smithery', 'settings.json');
  }
  return join(homedir(), '.config', 'smithery', 'settings.json');
}

function getSmitheryApiKey() {
  if (process.env.SMITHERY_API_KEY) return process.env.SMITHERY_API_KEY;

  const settingsPath = getSmitherySettingsPath();
  if (!existsSync(settingsPath)) {
    throw new Error('SMITHERY_API_KEY is not set and Smithery settings were not found. Run `npx --yes smithery@latest auth login` first.');
  }

  const settings = JSON.parse(readFileSync(settingsPath, 'utf8'));
  if (!settings.apiKey) {
    throw new Error('Smithery settings do not contain an API key. Run `npx --yes smithery@latest auth login` first.');
  }
  return settings.apiKey;
}

async function listTools() {
  const transport = new StdioClientTransport({
    command: 'node',
    args: ['dist/stdio.js'],
  });
  const client = new Client({ name: 'openfate-smithery-publisher', version: packageMetadata.version });

  await client.connect(transport);
  const result = await client.listTools();
  await client.close();

  return result.tools;
}

if (!existsSync(bundlePath)) {
  throw new Error(`MCPB bundle not found at ${bundlePath.pathname}. Run \`npm run mcpb:pack\` first.`);
}

const tools = await listTools();
const payload = {
  type: 'stdio',
  runtime: 'node',
  serverCard: {
    serverInfo: {
      name: 'openfate-bazi-mcp',
      version: packageMetadata.version,
    },
    tools: tools.map((tool) => ({
      name: tool.name,
      description: tool.description ?? '',
      inputSchema: tool.inputSchema ?? { type: 'object', properties: {} },
    })),
  },
};

const apiKey = getSmitheryApiKey();
const form = new FormData();
form.append('payload', JSON.stringify(payload));
form.append(
  'bundle',
  new Blob([readFileSync(bundlePath)], { type: 'application/octet-stream' }),
  `openfate-bazi-mcp-v${packageMetadata.version}.mcpb`,
);

const response = await fetch(`https://api.smithery.ai/servers/${encodeURIComponent(qualifiedName)}/releases`, {
  method: 'PUT',
  headers: {
    Accept: 'application/json',
    Authorization: `Bearer ${apiKey}`,
  },
  body: form,
});
const responseText = await response.text();
const parsedResponse = JSON.parse(responseText);

if (!response.ok) {
  throw new Error(`Smithery publish failed with ${response.status}: ${responseText}`);
}

console.log(JSON.stringify({
  qualifiedName,
  version: packageMetadata.version,
  deploymentId: parsedResponse.deploymentId,
  status: parsedResponse.status,
  mcpUrl: parsedResponse.mcpUrl,
}, null, 2));
