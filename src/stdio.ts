#!/usr/bin/env node

/* MCP */
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

/* Server */
import { createServer } from './mcp.js';

async function main(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error: unknown) => {
  console.error('[openfate-bazi-mcp] fatal:', error);
  process.exit(1);
});
