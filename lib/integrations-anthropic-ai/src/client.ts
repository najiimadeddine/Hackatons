import Anthropic from "@anthropic-ai/sdk";

const baseURL = process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL;
const apiKey = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY;

export const isAIAvailable = !!(baseURL && apiKey);

export const anthropic = new Anthropic({
  apiKey: apiKey || "placeholder-not-configured",
  baseURL: baseURL || "https://api.anthropic.com",
});
