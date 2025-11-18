import { FunctionDeclaration, FunctionCall } from "@google/genai";

export interface MCPTool {
  id: string;
  name: string;
  description: string;
  parameters: string; // JSON string schema
  implementation: string; // JavaScript code body
  enabled: boolean;
}

export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system' // Representing tool outputs essentially
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  toolCalls?: FunctionCall[];
  toolResponses?: {
    name: string;
    response: any;
  }[];
  isError?: boolean;
  timestamp: number;
}

export type ToolExecutionResult = {
  name: string;
  result: any;
  isError?: boolean;
};
