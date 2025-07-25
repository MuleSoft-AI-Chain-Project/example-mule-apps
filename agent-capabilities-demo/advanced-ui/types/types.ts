// types.ts
import React from "react";

export enum LLMType {
  OPENAI = "OPENAI",
  MISTRAL_AI = "MISTRAL_AI",
}

export interface Tool {
  name: string;
  description: string;
}

export interface TokenUsageData {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface LLMSettings {
  llmType: LLMType;
  modelName: string;
  temperature: number;
  inputLimit: number;
  maxToken: number;
  chatMemory: boolean;
  maxMessages: number;
  tokenUsageData: TokenUsageData[];
  preDecoration: string;
  postDecoration: string;
  isRetrieveModalOpen: boolean;
  isAddToolModalOpen: boolean;
  tools: Tool[];
  newToolJson: string;
  toxicityDetection: boolean;
  grounded: boolean;
}

export interface SettingsPanelProps {
  isCollapsed: boolean;
  onExpand: () => void;
  settings: LLMSettings;
  onSettingsChange: ((settings: LLMSettings) => void) | ((prevSettings: LLMSettings) => LLMSettings);
}

export interface AccordionProps {
  title: string;
  children: React.ReactNode;
  icon: React.ElementType;
  defaultOpen?: boolean;
  isCollapsed?: boolean;
  onCollapsedClick?: () => void;
}

export interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}

export type ProviderModels = {
  [key in LLMType]: string[];
};

export interface QueryResult {
  payload: {
    response: string;
    sources: Array<{
      fileName: string;
      textSegment: string;
    }>;
  };
  attributes?: {
    additionalAttributes: {
      getLatest: string;
      question: string;
      storeName: string;
    };
    tokenUsage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  };
  question: string;
  toxicity?: {
    response: {
      results: Array<{
        category_scores: Record<string, number>;
      }>;
    };
  };
}

export interface Message {
  type: "user" | "agent";
  content: string | QueryResult;
  partialResponse?: string;
}

export interface QueryStoreProps {
  className?: string;
  storeNames: string[];
  llmSettings: LLMSettings;
}
