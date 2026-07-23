## 6. Function Calling 與 Agentic Prompt

Gemma 4 支援 function calling / tool use 的提示格式。模型本身不會執行程式，應用程式必須負責執行工具、驗證參數、處理錯誤、將結果回填給模型。

### 基本流程

1. 使用者提出問題。
2. 模型判斷是否需要工具。
3. 模型產生 tool call。
4. 應用程式解析 tool call。
5. 應用程式執行工具並取得結果。
6. 應用程式把 tool response 放回對話。
7. 模型根據工具結果輸出最終答案。

### 工具定義 Prompt 原則

工具描述要回答三件事：

1. 這個工具做什麼？
2. 什麼時候該用它？
3. 參數格式與限制是什麼？

### 工具 schema 範例

```json
{
  "type": "function",
  "function": {
    "name": "get_current_temperature",
    "description": "Get current temperature for a city. Use this when the user asks about weather conditions.",
    "parameters": {
      "type": "object",
      "properties": {
        "city": {
          "type": "string",
          "description": "City name, e.g. Tokyo, New York"
        },
        "unit": {
          "type": "string",
          "enum": ["celsius", "fahrenheit"]
        }
      },
      "required": ["city"]
    }
  }
}
```

### Agent System Prompt 範例

```text
You are a helpful assistant.

Rules:
- Use provided tools when the user asks about current information, calculations, or data lookups.
- Do not guess values that should come from tools.
- If a tool returns an error, explain the error and ask for clarification if needed.
- Do not call a tool unless it is relevant to the user's request.
```

### [第三方實務] 工具數量與描述

以下屬於第三方文章整理出的常見實務做法，不是 Gemma 官方規格本身。

部落格建議工具數量可先控制在 5～10 個，避免模型在太多工具間混淆。工具描述應明確寫出使用時機，例如：

```text
Use this tool only when the user explicitly asks for current weather.
```

比：

```text
Get weather information.
```

更好。

### [官方 + 第三方實務] 防呆與安全

官方文件強調，Gemma 不會自行執行程式。當模型產生 tool call 或程式碼時，應用程式要負責執行與保護。以下清單混合了官方方向與常見部署防呆做法：

- 驗證 function name 是否在 allowlist。
- 驗證參數型別與範圍。
- 對外部 API 加 timeout。
- 對工具回傳結果做大小限制。
- 設定 max_steps，避免無限工具迴圈。
- 不直接 eval 模型輸出的任意程式碼。
- 對敏感操作加入人工確認或額外授權。

### 多步驟代理 Prompt

```text
請完成任務時遵守：
1. 需要外部資料時先呼叫工具，不要猜測。
2. 每次工具結果回來後，先判斷是否足夠回答。
3. 若仍不足，最多再呼叫下一個必要工具。
4. 最終回答必須清楚標示根據哪些工具結果。
```

### 來源

- S-02（官方）：Gemma 4 Prompt Formatting
- S-04（官方）：Function calling with Gemma 4
- S-55（部落格）：如何用 Gemma 4 函式呼叫建構 AI 代理
