## 4. Thinking Mode：何時啟用、如何使用、如何管理

Gemma 4 的 thinking mode 用於讓模型在輸出最終答案前先產生 reasoning process。官方文件提供兩個層次的啟用方式：

- **API 層**（S-06）：傳入 `enable_thinking=True`，processor 會自動在 prompt 中插入正確的 thinking token，開發者不需手動操作。
- **Prompt formatting 層**（S-02）：直接在 system turn 加入 `<|think|>`，適合需要完整控制對話範本的場景。

### 啟用方式概念

在底層 prompt formatting 中，thinking mode 可透過 system turn 啟用：

```text
<|turn>system
<|think|><turn|>
<|turn>user
請解這個多步驟問題……<turn|>
<|turn>model
```

### 適合啟用 Thinking 的任務

| 任務                  | 建議                     |
| --------------------- | ------------------------ |
| 多步驟推理            | 啟用                     |
| 複雜數學或邏輯        | 啟用                     |
| 需要工具呼叫前判斷    | 啟用                     |
| 多模態推理            | 可啟用                   |
| 複雜 JSON schema 生成 | 可啟用                   |
| 簡單翻譯              | 通常不需要               |
| 簡單格式轉換          | 通常不需要               |
| OCR / 文字提取        | 通常不需要，除非還要推理 |
| 簡短摘要              | 通常不需要               |

### Thinking 的成本與延遲

Thinking mode 會產生額外 token，因此通常會增加延遲與計算成本。對簡單任務而言，thinking 可能不是品質提升，而是浪費。

### [官方] 多輪對話中的 thought 管理

官方文件特別提醒：在一般多輪對話中，應該在下一輪送回模型前移除前一輪生成的 thoughts。  
但在單一 function/tool calling 流程中，如果同一輪還在進行工具呼叫，thoughts 不應在工具呼叫之間移除。

### [編者建議] 長任務的 reasoning summary

以下做法屬於編者整理的實務建議，並非官方文件的明文規範。

對長時間代理流程，若完全丟棄 reasoning context 可能導致模型重複思考或走回頭路。比較穩妥的方式是：

1. 不直接保留完整 thoughts。
2. 把前一輪推理濃縮為普通文字摘要。
3. 將摘要作為標準 context 放回對話中。
4. 明確標示這是「先前推理摘要」，不是使用者新指令。

範例：

```text
[先前推理摘要]
目前已確認：
- 使用者要分析三個方案。
- 方案 A 成本低但風險高。
- 方案 B 成本中等但可維護性較佳。
接下來請根據此摘要繼續完成比較表。
```

### Thinking Prompt 範例

```text
請分析以下部署方案。這是一個多步驟決策問題，請在回答前進行必要推理。

要求：
1. 比較成本、風險、維運複雜度、擴展性
2. 列出每個方案的適用情境
3. 最後給出建議方案與信心程度

輸出格式：
- 總結
- 比較表
- 風險清單
- 建議
```

### 來源

- S-02（官方）：Gemma 4 Prompt Formatting
- S-06（官方）：Thinking mode in Gemma
- S-53（部落格）：Gemma 4 思考模式：它做什麼以及何時使用
- S-54（部落格）：Gemma 4 結構化輸出：如何每次都取得可靠的 JSON
