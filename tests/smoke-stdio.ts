/* Assertions */
import assert from 'node:assert/strict';

/* MCP */
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

/* Node */
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const STDIO_ENTRY = resolve(__dirname, '../dist/stdio.js');

interface TextContent {
  type: string;
  text: string;
}

interface ToolCallResult {
  content: TextContent[];
}

async function main(): Promise<void> {
  const transport = new StdioClientTransport({
    command: 'node',
    args: [STDIO_ENTRY],
  });
  const client = new Client(
    { name: 'openfate-bazi-mcp-smoke', version: '0.0.0' },
    { capabilities: {} },
  );

  await client.connect(transport);

  const tools = await client.listTools();
  const toolNames = tools.tools.map((tool) => tool.name);
  assert.ok(toolNames.includes('calculate_bazi_chart'));
  assert.ok(toolNames.includes('detect_bazi_interactions'));
  assert.ok(toolNames.includes('calculate_true_solar_time'));
  assert.ok(toolNames.includes('reverse_bazi_to_solar_times'));
  assert.ok(toolNames.includes('get_openfate_bazi_policy'));

  const chartResult = await client.callTool({
    name: 'calculate_bazi_chart',
    arguments: {
      year: 1998,
      month: 12,
      day: 13,
      hour: 12,
      minute: 0,
      gender: 'female',
      longitude: 116.39,
      timezone: 8,
      dayBoundaryMode: 'ZI_HOUR_23',
    },
  }) as ToolCallResult;
  const chartPayload = JSON.parse(chartResult.content[0].text);
  assert.equal(chartPayload.attribution.brand, 'OpenFate.ai');
  assert.equal(chartPayload.data.chart.pillars.year.stem + chartPayload.data.chart.pillars.year.branch, '戊寅');
  assert.equal(chartPayload.data.chart.pillars.year.ganZhi, '戊寅');
  assert.equal(chartPayload.data.chart.pillars.year.naYin, '城头土');
  assert.deepEqual(chartPayload.data.chart.pillars.year.voidBranches, ['申', '酉']);
  assert.equal(chartPayload.data.chart.daYun.startYear, 2000);
  assert.equal(chartPayload.data.chart.daYun.startAge, 2);
  assert.equal(chartPayload.data.chart.calendar.zodiac, '虎');
  assert.equal(chartPayload.data.chart.metadata.trueSolarTimeApplied, true);

  // DST civil correction must survive the server boundary (the ...input passthrough) with
  // True Solar Time disabled — 1988-07-15 15:20 DST=1 is physically 14:20 standard, so the
  // hour pillar must be 未, not the raw-clock 申. Regression guard for engine >=1.1.1.
  const dstResult = await client.callTool({
    name: 'calculate_bazi_chart',
    arguments: {
      year: 1988,
      month: 7,
      day: 15,
      hour: 15,
      minute: 20,
      gender: 'male',
      longitude: 116.4,
      timezone: 8,
      dstOffset: 1,
      enableTrueSolarTime: false,
      dayBoundaryMode: 'ZI_HOUR_23',
    },
  }) as ToolCallResult;
  const dstPayload = JSON.parse(dstResult.content[0].text);
  assert.equal(dstPayload.data.chart.pillars.hour.branch, '未', 'DST-off dstOffset must shift 15:20→14:20 (未时) through the server');
  assert.equal(dstPayload.data.chart.metadata.trueSolarTimeApplied, false);

  const interactionResult = await client.callTool({
    name: 'detect_bazi_interactions',
    arguments: {
      yearBranch: '子',
      monthBranch: '午',
      dayBranch: '卯',
      hourBranch: '酉',
    },
  }) as ToolCallResult;
  const interactionPayload = JSON.parse(interactionResult.content[0].text);
  assert.ok(interactionPayload.data.interactions.length > 0);

  await client.close();
  console.log('[openfate-bazi-mcp] smoke passed');
}

main().catch((error: unknown) => {
  console.error('[openfate-bazi-mcp] smoke failed:', error);
  process.exit(1);
});
