import Anthropic from "@anthropic-ai/sdk";

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error(
    "ANTHROPIC_API_KEY 未設定。請喺 .env.local 入面加入你嘅 API key。"
  );
}

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: process.env.ANTHROPIC_BASE_URL || undefined,
});

export const MODEL =
  process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
