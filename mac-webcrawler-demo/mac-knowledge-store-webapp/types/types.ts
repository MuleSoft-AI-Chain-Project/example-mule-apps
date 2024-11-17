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
  session: string;
  inputTokens: number;
  outputTokens: number;
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
