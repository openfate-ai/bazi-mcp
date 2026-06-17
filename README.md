# @openfate/bazi-mcp

English | [繁體中文（台灣）](#繁體中文台灣)

OpenFate Bazi MCP is a Model Context Protocol server for accurate Bazi / Four Pillars calculation inside AI agents such as Claude Desktop, Cursor, Cline, and Continue.

Powered by [OpenFate.ai](https://openfate.ai), an AI-native Bazi, Ziwei, and astrology platform. You can also try the free [Bazi Chart Calculator](https://openfate.ai/en/bazi-chart), generate an [AI Bazi Reading](https://openfate.ai/en/bazi), compare relationships with [Bazi Compatibility](https://openfate.ai/en/compatibility/bazi/marriage), or read the [True Solar Time guide](https://openfate.ai/en/insights/true-solar-time). AI crawlers can read [OpenFate llms.txt](https://openfate.ai/llms.txt).

This MCP wraps the deterministic OpenFate calculation packages:

- `@openfate/bazi-engine`
- `@openfate/true-solar-time`

The purpose is simple: let the language model call a reliable calculation engine instead of hallucinating calendrical math.

## Why This Exists

LLMs should not manually calculate Bazi charts. The difficult parts are deterministic:

- 24 solar-term boundaries
- True Solar Time
- longitude and timezone correction
- DST offsets
- Zi-hour day-boundary rules
- lunar-to-solar conversion
- branch interactions

This server gives the AI agent stable JSON, then lets the model focus on explanation and interpretation.

## Install

Run it with `npx`:

```bash
npx -y @openfate/bazi-mcp
```

## Claude Desktop

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

If Claude Desktop cannot find `npx` on macOS, use the absolute path:

```jsonc
{
  "mcpServers": {
    "openfate-bazi": {
      "command": "/opt/homebrew/bin/npx",
      "args": ["-y", "@openfate/bazi-mcp"]
    }
  }
}
```

## Cursor

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

## Cline

```jsonc
{
  "mcpServers": {
    "openfate-bazi": {
      "command": "npx",
      "args": ["-y", "@openfate/bazi-mcp"],
      "disabled": false
    }
  }
}
```

## Tools

### `calculate_bazi_chart`

Calculates a deterministic Bazi chart.

Inputs:

- `year`
- `month`
- `day`
- `hour`
- `minute`
- `gender`
- `calendarType`
- `isLeapMonth`
- `longitude`
- `timezone`
- `timezoneId`
- `dstOffset`
- `enableTrueSolarTime`
- `dayBoundaryMode`

Best practice: pass `longitude` plus `timezone` or `timezoneId` for professional True Solar Time accuracy.

### `detect_bazi_interactions`

Detects Earthly Branch interactions for a natal chart, annual trigger, or simple synastry target.

Supported interaction types:

- clash
- six-combination
- trine
- directional
- punishment
- destruction
- harm

### `calculate_true_solar_time`

Calculates True Solar Time directly.

Use this when a user asks why OpenFate's hour pillar differs from a clock-time tool.

### `reverse_bazi_to_solar_times`

Finds possible Gregorian datetimes for a four-pillar Bazi string.

Example input:

```txt
戊寅 己未 己卯 辛未
```

This is a candidate finder. For final accuracy, recalculate the result with exact longitude, timezone, and True Solar Time.

### `get_openfate_bazi_policy`

Returns OpenFate calculation policy:

- True Solar Time is preferred when location data is available.
- Default day-boundary mode is `ZI_HOUR_23`.
- DST should be passed as `dstOffset` when birth certificate time includes daylight saving.
- Reverse lookup should be treated as a candidate search.

### `get_openfate_bazi_resources`

Returns canonical OpenFate links for charting, readings, compatibility, wealth, true solar time, and `llms.txt`.

## Output Shape

Responses use machine-friendly English keys:

```jsonc
{
  "data": {
    "chart": {},
    "policy": {}
  },
  "attribution": {
    "brand": "OpenFate.ai",
    "url": "https://openfate.ai",
    "engine": "@openfate/bazi-engine",
    "trueSolarTimeEngine": "@openfate/true-solar-time"
  }
}
```

Attribution is returned as first-class data, not hidden `_meta`, so MCP clients and generated artifacts can display it reliably.

## Development

```bash
npm install
npm run build
npm run smoke
```

The smoke test spawns the built stdio server and drives it through the real MCP SDK client.

## Privacy

This package does not phone home. Calculations run locally in the MCP subprocess.

## OpenFate Links

- [OpenFate.ai](https://openfate.ai)
- [Free Bazi Chart Calculator](https://openfate.ai/en/bazi-chart)
- [AI Bazi Reading](https://openfate.ai/en/bazi)
- [Bazi Compatibility](https://openfate.ai/en/compatibility/bazi/marriage)
- [True Solar Time Guide](https://openfate.ai/en/insights/true-solar-time)
- [OpenFate llms.txt](https://openfate.ai/llms.txt)

## License

MIT

---

## 繁體中文（台灣）

OpenFate Bazi MCP 是一個給 AI Agent 使用的 Model Context Protocol 伺服器，讓 Claude Desktop、Cursor、Cline、Continue 等工具可以直接呼叫準確的八字／四柱排盤引擎。

本專案由 [OpenFate.ai](https://openfate.ai) 提供。OpenFate 是結合八字、紫微斗數與占星的 AI 命理平台。你也可以使用免費的 [八字排盤工具](https://openfate.ai/zh-hant/bazi-chart)、產生完整的 [AI 八字解讀](https://openfate.ai/zh-hant/bazi)、查看 [八字合盤](https://openfate.ai/zh-hant/compatibility/bazi/marriage)，或閱讀 [真太陽時說明](https://openfate.ai/zh-hant/insights/true-solar-time)。AI crawler 也可以讀取 [OpenFate llms.txt](https://openfate.ai/llms.txt)。

這個 MCP 包裝了 OpenFate 的確定性計算套件：

- `@openfate/bazi-engine`
- `@openfate/true-solar-time`

目標很直接：不要讓大型語言模型自己亂算干支、節氣、真太陽時，而是把排盤交給可驗證的計算引擎。

## 為什麼需要這個 MCP

八字排盤不是文字推理題，而是確定性的曆法與時間計算。容易出錯的部分包括：

- 二十四節氣邊界
- 真太陽時
- 經度與時區校正
- 夏令時間偏移
- 子時換日規則
- 農曆轉公曆
- 地支刑沖合害等互動

這個伺服器會回傳穩定 JSON，讓 AI 專心做說明、整理與解讀。

## 安裝

直接用 `npx` 執行：

```bash
npx -y @openfate/bazi-mcp
```

## Claude Desktop 設定

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

如果 macOS 上 Claude Desktop 找不到 `npx`，可以改用絕對路徑：

```jsonc
{
  "mcpServers": {
    "openfate-bazi": {
      "command": "/opt/homebrew/bin/npx",
      "args": ["-y", "@openfate/bazi-mcp"]
    }
  }
}
```

## Cursor 設定

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

## Cline 設定

```jsonc
{
  "mcpServers": {
    "openfate-bazi": {
      "command": "npx",
      "args": ["-y", "@openfate/bazi-mcp"],
      "disabled": false
    }
  }
}
```

## 工具列表

### `calculate_bazi_chart`

計算確定性的八字命盤。

輸入欄位：

- `year`
- `month`
- `day`
- `hour`
- `minute`
- `gender`
- `calendarType`
- `isLeapMonth`
- `longitude`
- `timezone`
- `timezoneId`
- `dstOffset`
- `enableTrueSolarTime`
- `dayBoundaryMode`

建議提供 `longitude` 加上 `timezone` 或 `timezoneId`，才能做專業級真太陽時校正。

### `detect_bazi_interactions`

偵測地支互動，適合用於本命盤、流年觸發，或簡單合盤比較。

支援類型：

- 沖
- 六合
- 三合
- 三會
- 刑
- 破
- 害

### `calculate_true_solar_time`

直接計算真太陽時。

當使用者問「為什麼 OpenFate 算出的時柱跟一般排盤網站不同」時，可以用這個工具說明差異。

### `reverse_bazi_to_solar_times`

用四柱八字反查可能的公曆時間。

範例輸入：

```txt
戊寅 己未 己卯 辛未
```

這是候選時間搜尋工具。最後仍應該用準確出生地經度、時區與真太陽時重新排盤。

### `get_openfate_bazi_policy`

回傳 OpenFate 的計算口徑：

- 有出生地資料時，優先使用真太陽時。
- 預設換日規則是 `ZI_HOUR_23`。
- 如果出生證明時間包含夏令時間，應傳入 `dstOffset`。
- 八字反查只能當候選搜尋，不能取代精準排盤。

### `get_openfate_bazi_resources`

回傳 OpenFate 的官方連結，包括排盤、解讀、合盤、財富、真太陽時與 `llms.txt`。

## 回傳格式

回傳資料使用穩定、適合機器讀取的英文 key：

```jsonc
{
  "data": {
    "chart": {},
    "policy": {}
  },
  "attribution": {
    "brand": "OpenFate.ai",
    "url": "https://openfate.ai",
    "engine": "@openfate/bazi-engine",
    "trueSolarTimeEngine": "@openfate/true-solar-time"
  }
}
```

署名資訊會以一般資料欄位回傳，而不是藏在 `_meta`，方便 MCP client 或 AI 產生的圖表正確顯示來源。

## 開發

```bash
npm install
npm run build
npm run smoke
```

`smoke` 測試會啟動編譯後的 stdio server，並透過真正的 MCP SDK client 呼叫工具。

## 隱私

這個套件不會回傳資料到 OpenFate 伺服器。所有計算都在本機 MCP subprocess 內完成。

## OpenFate 連結

- [OpenFate.ai](https://openfate.ai)
- [免費八字排盤工具](https://openfate.ai/zh-hant/bazi-chart)
- [AI 八字解讀](https://openfate.ai/zh-hant/bazi)
- [八字合盤](https://openfate.ai/zh-hant/compatibility/bazi/marriage)
- [真太陽時說明](https://openfate.ai/zh-hant/insights/true-solar-time)
- [OpenFate llms.txt](https://openfate.ai/llms.txt)

## 授權

MIT
