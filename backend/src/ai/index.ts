import { AnthropicProvider } from "./anthropicProvider.js";
import { MockProvider } from "./mockProvider.js";
import type { AIProvider } from "./types.js";

let cached: AIProvider | undefined;

export function getAIProvider(): AIProvider {
  if (cached) return cached;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  cached = apiKey ? new AnthropicProvider(apiKey) : new MockProvider();
  return cached;
}

export * from "./types.js";
