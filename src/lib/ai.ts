import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

type Provider = "anthropic" | "openai" | "gemini" | "groq" | "ollama" | "custom";

const provider = (process.env.AI_PROVIDER || "anthropic") as Provider;

const DEFAULT_MODELS: Record<Provider, string> = {
  anthropic: "claude-sonnet-4-6",
  openai: "gpt-4o",
  gemini: "gemini-2.0-flash",
  groq: "llama-3.3-70b-versatile",
  ollama: "llama3.1",
  custom: process.env.CUSTOM_MODEL || "gpt-4o",
};

const model = process.env.AI_MODEL || DEFAULT_MODELS[provider];

function getOpenAIClient(): OpenAI {
  switch (provider) {
    case "openai":
      return new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    case "gemini":
      return new OpenAI({
        apiKey: process.env.GEMINI_API_KEY,
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
      });
    case "groq":
      return new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: "https://api.groq.com/openai/v1",
      });
    case "ollama":
      return new OpenAI({
        apiKey: "ollama",
        baseURL: process.env.OLLAMA_BASE_URL || "http://localhost:11434/v1",
      });
    case "custom":
      return new OpenAI({
        apiKey: process.env.CUSTOM_API_KEY || "",
        baseURL: process.env.CUSTOM_BASE_URL,
      });
    default:
      throw new Error(`Provider "${provider}" does not use OpenAI client`);
  }
}

function getAnthropicClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY 未設定。請喺 .env.local 入面加入你嘅 API key。"
    );
  }
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    baseURL: process.env.ANTHROPIC_BASE_URL || undefined,
  });
}

export async function chatCompletion(opts: {
  system: string;
  userMessage: string;
  maxTokens: number;
}): Promise<string> {
  if (provider === "anthropic") {
    const client = getAnthropicClient();
    const stream = client.messages.stream({
      model,
      max_tokens: opts.maxTokens,
      system: opts.system,
      messages: [{ role: "user", content: opts.userMessage }],
    });

    let text = "";
    stream.on("text", (chunk) => {
      text += chunk;
    });
    await stream.finalMessage();
    return text;
  }

  // All other providers use OpenAI-compatible API
  const client = getOpenAIClient();
  const response = await client.chat.completions.create({
    model,
    max_tokens: opts.maxTokens,
    messages: [
      { role: "system", content: opts.system },
      { role: "user", content: opts.userMessage },
    ],
  });

  return response.choices[0]?.message?.content || "";
}

export async function* chatCompletionStream(opts: {
  system: string;
  userMessage: string;
  maxTokens: number;
}): AsyncGenerator<string> {
  if (provider === "anthropic") {
    const client = getAnthropicClient();
    const stream = client.messages.stream({
      model,
      max_tokens: opts.maxTokens,
      system: opts.system,
      messages: [{ role: "user", content: opts.userMessage }],
    });

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        yield event.delta.text;
      }
    }
    return;
  }

  // OpenAI-compatible streaming
  const client = getOpenAIClient();
  const stream = await client.chat.completions.create({
    model,
    max_tokens: opts.maxTokens,
    stream: true,
    messages: [
      { role: "system", content: opts.system },
      { role: "user", content: opts.userMessage },
    ],
  });

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content;
    if (text) {
      yield text;
    }
  }
}

export { provider, model };
