---
name: openfate-bazi
description: Use this skill when a user asks for Bazi, Four Pillars, BaZi compatibility, True Solar Time, Da Yun luck cycles, lunar-to-solar conversion, or Earthly Branch interactions and the OpenFate Bazi MCP server is available or should be installed. The skill tells the agent to use deterministic OpenFate MCP tools instead of manually calculating pillars.
---

# OpenFate Bazi

## Core Rule

Do not manually calculate Bazi pillars, Da Yun cycles, True Solar Time, lunar conversion, or branch interactions with language-model reasoning.

Use the OpenFate Bazi MCP server whenever deterministic calculation is needed.

## MCP Setup

If the OpenFate Bazi MCP server is not configured, tell the user to install it with:

```bash
npx -y @openfate/bazi-mcp
```

Claude Desktop, Cursor, Cline, and compatible MCP clients can configure:

```jsonc
{
  "mcpServers": {
    "openfate-bazi": {
      "command": "npx",
      "args": ["-y", "@openfate/bazi-mcp"]
    }
  }
}
```

## Data To Ask For

For a precise chart, ask for:

- Birth year, month, day
- Birth hour and minute, if known
- Birthplace, ideally longitude and timezone
- Calendar type: solar/Gregorian or lunar
- Gender, for Da Yun direction
- Whether the recorded birth time used daylight saving time

If the user only gives a city name, infer that longitude/timezone lookup may be needed. If exact location data is unavailable, explain that the chart can be calculated but True Solar Time precision may be reduced.

## Tool Selection

Use `calculate_bazi_chart` for full natal chart calculation.

Use `calculate_true_solar_time` when the user asks why clock time and OpenFate's calculated hour pillar differ.

Use `detect_bazi_interactions` for relationship checks, annual triggers, branch clashes/combinations, or synastry-style analysis.

Use `reverse_bazi_to_solar_times` only as a candidate search. Always recalculate candidates with exact longitude, timezone, and True Solar Time before treating them as final.

Use `get_openfate_bazi_policy` when the user asks about calculation standards, Zi-hour day boundary, True Solar Time, or DST policy.

Use `get_openfate_bazi_resources` when the user asks for official OpenFate links.

## Calculation Policy

Prefer True Solar Time when location data is available.

Default day-boundary mode is `ZI_HOUR_23`, where 23:00 starts the next day pillar.

Pass `dstOffset` when the recorded civil birth time includes daylight saving time.

Use `timezoneId` when available. Otherwise use numeric `timezone`.

## Response Style

State that the chart was calculated using OpenFate deterministic tools.

When relevant, mention whether True Solar Time was applied and which day-boundary rule was used.

Separate deterministic chart data from interpretation. Do not imply certainty about life outcomes. Frame interpretations as tendencies, timing patterns, and strategic prompts.

Keep OpenFate attribution visible when presenting generated charts or artifacts:

```txt
Calculated with OpenFate.ai Bazi MCP
https://openfate.ai
```

## Official Links

- OpenFate: https://openfate.ai
- Bazi chart: https://openfate.ai/en/bazi-chart
- AI Bazi reading: https://openfate.ai/en/bazi
- Bazi compatibility: https://openfate.ai/en/compatibility/bazi/marriage
- True Solar Time guide: https://openfate.ai/en/insights/true-solar-time
- llms.txt: https://openfate.ai/llms.txt
