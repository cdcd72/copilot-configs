## 5. Output Format：穩定輸出格式的寫法

Gemma 4 可以輸出自然語言、Markdown、表格與 JSON。若目標是可被程式使用，提示中必須明確指定格式，並在應用層驗證。

### Markdown 表格

```text
請用 Markdown 表格輸出，欄位如下：
| 類型 | 問題 | 影響 | 建議 |
```

### 多層摘要

```text
請將以下文章摘要成三個層級：
1. 一句話摘要
2. 一段話摘要
3. 關鍵細節 bullet list
```

### JSON-only Prompt

```text
你是一個 JSON-only response API。
你必須只回傳有效 JSON。
不要 Markdown。
不要解釋。
不要 code block。

Schema:
{
  "sentiment": "positive | negative | neutral",
  "confidence": "number between 0 and 1",
  "topics": ["string"],
  "summary": "string"
}

請分析：
[文字]
```

### JSON Schema Prompt

```text
請只輸出符合以下 schema 的 JSON：

{
  "type": "object",
  "properties": {
    "title": {"type": "string"},
    "risk_level": {"type": "string", "enum": ["low", "medium", "high"]},
    "findings": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "issue": {"type": "string"},
          "impact": {"type": "string"},
          "recommendation": {"type": "string"}
        },
        "required": ["issue", "impact", "recommendation"]
      }
    }
  },
  "required": ["title", "risk_level", "findings"]
}
```

### [官方 + 第三方實務] 結構化輸出的可靠性策略

以下策略分成兩類：官方文件可直接支持的做法，以及第三方實務文章整理出的建議。

**官方或來源可直接支持的做法**

1. **在 prompt 中明確要求輸出格式。**
2. **用 schema 驗證輸出。**
3. **保持 schema 簡短，避免一次要求太多欄位。**

**第三方實務整理的建議**

4. **使用執行環境支援的 JSON mode / format 參數。**
5. **加入 retry 機制。**
6. **對巢狀結構保持克制，2～3 層通常較穩。**
7. **低溫度設定通常較適合穩定 JSON。**
8. **必要時加入 few-shot JSON 範例。**

### 常見失敗與修復

| 失敗                          | 原因               | 修復                                              |
| ----------------------------- | ------------------ | ------------------------------------------------- |
| JSON 外包 Markdown code block | 模型想讓輸出更易讀 | 明確要求 raw JSON，使用 JSON mode，或清理 wrapper |
| 多出未要求欄位                | schema 約束不足    | 驗證時禁止 extra fields                           |
| 欄位型別錯誤                  | 模型把數字當字串   | 使用 schema 驗證與轉換                            |
| null 或空欄位                 | 輸入資料不足       | schema 中明確允許 optional，或要求缺漏說明        |
| 巢狀過深                      | 任務太複雜         | 拆分任務或簡化 schema                             |

### 來源

- S-02（官方）：Gemma 4 Prompt Formatting
- S-04（官方）：Function calling with Gemma 4
- S-54（部落格）：Gemma 4 結構化輸出：如何每次都取得可靠的 JSON
- S-51（部落格）：50 個最佳 Gemma 4 提示詞：程式設計、寫作、分析與多模態（2026）
