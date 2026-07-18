# 📖 粵語金融術語學堂 | Cantonese Finance Tutor

> Yo 各位！有冇試過睇英文金融論文，成堆術語睇到頭都大？
>
> 今日呢個 Project 就係幫你搞掂呢個問題 —— 你就淨係需要 Upload 一份 PDF，AI 就會自動幫你掃出所有專業術語，然後用最地道嘅廣東話同你逐個解釋清楚！

## 點樣運作？三步搞掂！

1. **📄 上載 PDF** — 論文、研報、教材、年報，乜都得
2. **🔍 AI 自動掃描** — Claude AI 幫你搵出所有金融專業術語
3. **🗣️ 粵語解釋** — 用你聽得明嘅廣東話，將高深概念講到你秒懂

## Demo

上載一份 PDF 之後，AI 會即時提取術語並生成解釋：

```
術語：Quantitative Easing (量化寬鬆)
粵語解釋：即係央行瘋狂印銀紙去買債券，等市場多啲錢流通，
         希望刺激經濟。簡單啲講，就係「開水喉放水」。
```

## Tech Stack

| 層面 | 技術 |
|------|------|
| Frontend | Next.js 16 + React 19 + Tailwind CSS |
| AI | Claude API (Anthropic) |
| Database | SQLite (better-sqlite3) |
| PDF 解析 | pdf-parse |
| 狀態管理 | Zustand |

## 點樣跑起佢？

```bash
# 1. Clone 落嚟
git clone https://github.com/isaaccwb/cantonese-finance-tutor.git
cd cantonese-finance-tutor

# 2. 裝 dependencies
npm install

# 3. 設定環境變量
cp .env.example .env.local
# 然後填入你嘅 Anthropic API Key

# 4. 開跑！
npm run dev
```

打開 http://localhost:3000 就用得啦！

## 環境變量

```env
ANTHROPIC_API_KEY=your-api-key-here
```

## 功能一覽

- 上載 PDF 自動提取金融術語
- Claude AI 生成地道粵語解釋
- 術語詳細頁面（中英對照 + 例句）
- 歷史記錄查看已掃描文件
- SQLite 本地儲存，快速查詢

## 點解要做呢個？

香港人讀金融，成日要睇英文材料。好多術語就算識英文都未必即刻 get 到個意思。如果有個工具可以用廣東話同你解釋，學習效率即刻翻倍！

---

Built with Claude AI | Made in Hong Kong 🇭🇰
