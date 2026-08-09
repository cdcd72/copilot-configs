## 13. 常見錯誤與修正

本章混合了可由官方文件直接支持的做法、第三方實務建議，以及少量編者整理的修正方向。對於容易被誤認為官方規格的項目，以下會補充標示。

### 錯誤 1：任務太模糊

```text
幫我整理。
```

修正：

```text
請將以下內容整理成 Markdown 筆記，包含：
1. 背景
2. 問題
3. 解法
4. 風險
5. 待確認事項
```

### 錯誤 2：沒有輸出格式

修正：

```text
請用表格輸出，欄位包含：項目、說明、風險、建議。
```

### 錯誤 3：沒有說明缺漏資料時怎麼辦

修正：

```text
若資料不足，請不要猜測，請輸出「資料不足」並列出缺少哪些資訊。
```

### [第三方實務] 錯誤 4：要求 JSON 卻沒有驗證

修正：

- 使用 JSON-only system prompt。
- 使用執行環境支援的 JSON mode。
- 使用 schema validation。
- 設定 retry。
- 限制 schema 複雜度。

### [第三方實務] 錯誤 5：工具描述太短

```text
get_weather: get weather
```

修正：

```text
get_weather: Get current weather for a city. Use only when the user asks about current weather conditions. Required parameter: city.
```

### [第三方實務] 錯誤 6：Thinking 用在簡單任務

修正：

- 簡單翻譯、簡單摘要、格式轉換不一定需要 thinking。
- 多步驟推理、工具決策、複雜 schema、跨資料整合再啟用。

### [官方 + 編者建議] 錯誤 7：多輪對話不管理 thought context

修正：

- 一般多輪對話移除前一輪 raw thoughts。
- 長任務保留「摘要後的 reasoning context」，不要保留完整 raw thoughts。
- 工具呼叫同一輪中不要中途移除必要 thoughts。

### 來源

- S-02（官方）：Gemma 4 Prompt Formatting
- S-04（官方）：Function calling with Gemma 4
- S-51（部落格）：50 個最佳 Gemma 4 提示詞：程式設計、寫作、分析與多模態（2026）
- S-54（部落格）：Gemma 4 結構化輸出：如何每次都取得可靠的 JSON
- S-55（部落格）：如何用 Gemma 4 函式呼叫建構 AI 代理
