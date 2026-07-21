// types.js
export const LLMType = {
  OPENAI: "OPENAI",
  MISTRAL_AI: "MISTRAL_AI",
};

export const providerModels = {
  [LLMType.OPENAI]: [
    "gpt-4o",
    "gpt-4o-mini",
    "gpt-4o-turbo-preview",
  ],
  [LLMType.MISTRAL_AI]: ["mistral-small-latest", "mistral-large-latest"],
};

