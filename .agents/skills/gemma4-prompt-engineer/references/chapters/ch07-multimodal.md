## 7. 多模態 Prompt：圖片與音訊

Gemma 4 支援文字與圖片輸入，部分模型也支援音訊。多模態提示需要把「媒體位置」與「任務」寫清楚。

### 圖片 Prompt 基本格式

```text
請描述這張圖片：
1. 主要物件
2. 物件位置
3. 可見文字
4. 色彩與風格
5. 可能的用途或情境
```

### UI 設計審查 Prompt

```text
請審查這張 UI 截圖，針對以下面向提供回饋：

1. 視覺層次
2. 色彩使用
3. 字體與排版
4. 間距
5. 可讀性
6. 無障礙設計
7. 具體改善建議

請用表格輸出，欄位為：
- 面向
- 觀察
- 問題
- 建議
```

### OCR / 文字提取 Prompt

```text
請提取圖片中所有可見文字。

要求：
- 按區塊整理
- 保留原文順序
- 無法辨識的字用 [不清楚] 標示
- 不要猜測不存在的文字
```

### 圖片比較 Prompt

```text
請比較兩張圖片：

1. 相同之處
2. 不同之處
3. 哪一張更適合用於 [用途]
4. 原因
5. 若要改善，具體建議是什麼
```

### 音訊提示格式

官方文件提供兩類音訊任務：

#### ASR：語音辨識

```text
Transcribe the following speech segment in {LANGUAGE} into {LANGUAGE} text.

Follow these specific instructions for formatting the answer:
- Only output the transcription, with no newlines.
- When transcribing numbers, write digits instead of words.
```

> 備註：ASR 是將語音音訊「原封不動」地辨識並轉換成相同語言的文字。

#### AST：語音翻譯

```text
Transcribe the following speech segment in {SOURCE_LANGUAGE}, then translate it into {TARGET_LANGUAGE}.

When formatting the answer:
- First output the transcription in {SOURCE_LANGUAGE}
- Then one newline
- Then output "{TARGET_LANGUAGE}: "
- Then the translation in {TARGET_LANGUAGE}
```

> 備註：AST 是將語音音訊進行辨識後，直接「翻譯」成另一種語言的文字。

### 多模態資料的提示原則

1. 明確說明每個媒體輸入的用途。
2. 若有多張圖片，為每張圖片編號。
3. 若要 OCR，不要同時要求太多推論。
4. 若要設計回饋，明確列出評估面向。
5. 若要結構化資料，指定 JSON 或表格格式。
6. 若模型看不到或無法辨識，要求它明確說明不確定性。

### 來源

- S-01（官方）：Gemma 4 model card
- S-02（官方）：Gemma 4 Prompt Formatting
- S-05（官方）：Image understanding
- S-06（官方）：Thinking mode in Gemma
- S-51（部落格）：50 個最佳 Gemma 4 提示詞：程式設計、寫作、分析與多模態（2026）
- S-52（部落格）：Gemma 4 的 10 個實用使用場景：你實際上能拿它做什麼
