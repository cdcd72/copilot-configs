## 14. Prompt Checklist

本章 checklist 以可操作性為主，因此同時混合官方格式要求與第三方實務檢查點。

### 基本任務 Checklist

- [ ] 是否明確說明任務？
- [ ] 是否提供足夠上下文？
- [ ] 是否指定輸出格式？
- [ ] 是否列出限制條件？
- [ ] 是否說明資訊不足時的處理方式？
- [ ] 是否要求不要捏造？
- [ ] 是否避免一次要求太多不相關任務？

### Coding Checklist

- [ ] 語言與版本是否明確？
- [ ] 框架與套件限制是否明確？
- [ ] 輸入與輸出是否明確？
- [ ] 錯誤處理是否要求？
- [ ] 測試範圍是否列出？
- [ ] 是否要求指出具體程式碼位置？
- [ ] 是否要求保留既有業務邏輯？

### [官方 + 第三方實務] JSON Checklist

- [ ] 是否要求只輸出 JSON？
- [ ] 是否提供 schema？
- [ ] 是否限制不要 Markdown code block？
- [ ] 是否在應用層驗證？
- [ ] 是否設定 retry？
- [ ] schema 是否過度複雜？
- [ ] optional 欄位是否定義清楚？

### [官方 + 第三方實務] Tool Calling Checklist

- [ ] 工具名稱是否清楚？
- [ ] 工具描述是否包含使用時機？
- [ ] 參數是否有型別與 required？
- [ ] 工具數量是否過多？
- [ ] 是否設定 max_steps？
- [ ] 是否驗證工具參數？
- [ ] 是否處理工具錯誤？
- [ ] 是否避免模型直接猜測工具資料？

### [官方 + 編者建議] Thinking Checklist

- [ ] 任務是否真的需要多步驟推理？
- [ ] 是否啟用 thinking mode？
- [ ] 是否避免在簡單任務濫用 thinking？
- [ ] 多輪對話是否移除 raw thoughts？
- [ ] 長任務是否改用 reasoning summary？
- [ ] 是否分離 final answer 與 thought content？
