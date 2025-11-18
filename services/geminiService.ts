import { GoogleGenAI, Chat, FunctionDeclaration, Type } from "@google/genai";
import { MCPTool, ChatMessage, MessageRole } from "../types";

// We'll keep a reference to the chat instance to maintain history automatically
// However, because we might change tools dynamically, we might need to recreate the session 
// or just rely on the history array and start fresh if tools change drastically. 
// For this app, passing history manually to a new chat or maintaining one is a design choice.
// We will recreate the chat session for each turn to ensure latest tools are used, 
// but we must manually feed history.

export const createGeminiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

export const convertToolsToDeclarations = (tools: MCPTool[]): FunctionDeclaration[] => {
  return tools
    .filter(t => t.enabled)
    .map(t => {
      try {
        const parsedParams = JSON.parse(t.parameters);
        // Ensure type enums are correct if the user pasted standard JSON schema
        // The Gemini SDK expects Type.OBJECT, etc.
        // We will trust the user parsed JSON is structurally compatible for now
        return {
          name: t.name,
          description: t.description,
          parameters: parsedParams
        };
      } catch (e) {
        console.error(`Failed to parse parameters for tool ${t.name}`, e);
        return null;
      }
    })
    .filter((t): t is FunctionDeclaration => t !== null);
};

export const sendMessageToGemini = async (
  history: ChatMessage[],
  newMessage: string,
  activeTools: MCPTool[]
): Promise<{
  response: any; // GenerateContentResponse
  chat: Chat;
}> => {
  const client = createGeminiClient();
  
  // Map internal history to Gemini history format
  const geminiHistory = history.map(msg => {
    const parts = [];
    if (msg.content) {
      parts.push({ text: msg.content });
    }
    if (msg.toolCalls) {
      msg.toolCalls.forEach(tc => {
        parts.push({ functionCall: tc });
      });
    }
    if (msg.toolResponses) {
      msg.toolResponses.forEach(tr => {
        parts.push({
          functionResponse: {
            name: tr.name,
            response: tr.response
          }
        });
      });
    }
    return {
      role: msg.role === MessageRole.USER ? 'user' : 'model',
      parts: parts
    };
  });

  const tools = convertToolsToDeclarations(activeTools);
  const toolsConfig = tools.length > 0 ? [{ functionDeclarations: tools }] : undefined;

  const chat = client.chats.create({
    model: 'gemini-2.5-flash',
    history: geminiHistory,
    config: {
      tools: toolsConfig,
    }
  });

  const result = await chat.sendMessage({
    message: newMessage
  });

  return { response: result, chat };
};

export const sendToolResponseToGemini = async (
  chat: Chat,
  toolResponses: { name: string, response: any }[]
) => {
  const parts = toolResponses.map(tr => ({
    functionResponse: {
      name: tr.name,
      response: tr.response
    }
  }));

  // Send the tool outputs back to the model
  const result = await chat.sendMessage({
    message: parts 
  });

  return result;
};
