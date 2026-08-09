## 2. Prompt Formatting：Gemma 4 的對話格式

Gemma 4 使用明確的控制 token 表示對話輪次與角色。核心概念如下：

| 用途               | Token / 角色 |
| ------------------ | ------------ |
| system instruction | `system`     |
| user turn          | `user`       |
| model turn         | `model`      |
| turn 開始          | `<\|turn>`   |
| turn 結束          | `<turn\|>`   |

### 基本對話格式

```text
<|turn>system
You are a helpful assistant.<turn|>
<|turn>user
Hello.<turn|>
<|turn>model
```

### 單輪使用者提示

```text
<|turn>user
請摘要以下文件，輸出 5 個重點。
[文件內容]<turn|>
<|turn>model
```

### System Instruction 的用途

System instruction 適合放：

- 角色設定
- 長期行為規則
- 安全與誠實規則
- 輸出風格
- 工具使用規則
- 是否啟用 thinking mode
- JSON-only 或 schema 對齊規則

### 範例：客服助理 System Prompt

```text
<|turn>system
You are a customer support assistant.
Rules:
- Be polite and professional.
- If you do not know the answer, say so.
- Never invent product features or pricing.
- Keep simple answers within 2-3 sentences.
Product information:
- Plan A: ...
- Plan B: ...<turn|>
<|turn>user
請問企業方案包含哪些功能？<turn|>
<|turn>model
```

### 設計原則

1. **System 放長期規則，User 放當次任務。**
2. **不要把所有規則塞進 user turn。**
3. **需要穩定風格時，將格式規則放 system。**
4. **需要本輪資料時，將資料放 user。**
5. **多輪對話要管理歷史，不要無限制累積無關內容。**

### 來源

- S-02（官方）：Gemma 4 Prompt Formatting
- S-03（官方）：Gemma Basic Text Inference
- S-54（部落格）：Gemma 4 結構化輸出：如何每次都取得可靠的 JSON
- S-52（部落格）：Gemma 4 的 10 個實用使用場景：你實際上能拿它做什麼
