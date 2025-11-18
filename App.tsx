import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import { DEFAULT_TOOLS } from './constants';
import { MCPTool, ChatMessage, MessageRole } from './types';
import { sendMessageToGemini, sendToolResponseToGemini } from './services/geminiService';
import { executeTool } from './utils/executor';
import { FunctionCall, GenerateContentResponse } from '@google/genai';

const App: React.FC = () => {
  const [tools, setTools] = useState<MCPTool[]>(DEFAULT_TOOLS);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSendMessage = async (text: string) => {
    if (!process.env.API_KEY) {
        alert("API_KEY missing in environment. Please check metadata.json or environment configuration.");
        return;
    }

    const userMsg: ChatMessage = {
      id: uuidv4(),
      role: MessageRole.USER,
      content: text,
      timestamp: Date.now()
    };

    const newHistory = [...history, userMsg];
    setHistory(newHistory);
    setIsLoading(true);

    try {
      // 1. Send user message to Gemini with current tools
      const { response, chat } = await sendMessageToGemini(newHistory, text, tools);
      
      await processGeminiResponse(response, chat, newHistory);

    } catch (error) {
      console.error("Chat Error:", error);
      setHistory(prev => [...prev, {
        id: uuidv4(),
        role: MessageRole.MODEL,
        content: "Sorry, I encountered an error processing your request.",
        isError: true,
        timestamp: Date.now()
      }]);
      setIsLoading(false);
    }
  };

  const processGeminiResponse = async (
    response: GenerateContentResponse,
    chat: any,
    currentHistory: ChatMessage[]
  ) => {
    let currentResponse = response;
    let loopLimit = 5; // Prevent infinite loops
    let loopCount = 0;

    while (loopCount < loopLimit) {
        const candidates = currentResponse.candidates;
        if (!candidates || candidates.length === 0) break;

        const content = candidates[0].content;
        const parts = content.parts;
        
        // Extract text parts
        const textParts = parts.filter(p => p.text).map(p => p.text).join('');
        
        // Extract tool calls
        const toolCalls = parts
            .filter(p => p.functionCall)
            .map(p => p.functionCall as FunctionCall);

        // If we have tool calls, we need to execute them and recurse
        if (toolCalls.length > 0) {
            // 1. Show the tool call invocation in the UI immediately (as a model message)
            const toolCallMsg: ChatMessage = {
                id: uuidv4(),
                role: MessageRole.MODEL,
                content: textParts, // Might be empty if only tool call
                toolCalls: toolCalls,
                timestamp: Date.now()
            };
            
            // Update history with this interim state (execution pending)
            const updatedHistoryWithCall = [...currentHistory, toolCallMsg];
            setHistory(updatedHistoryWithCall);

            // 2. Execute tools
            const toolResponses: { name: string, response: any }[] = [];
            
            for (const call of toolCalls) {
                const toolConfig = tools.find(t => t.name === call.name);
                if (toolConfig) {
                    const result = await executeTool(call.name, call.args, toolConfig.implementation);
                    toolResponses.push({ name: call.name, response: result.result });
                } else {
                    toolResponses.push({ name: call.name, response: { error: "Tool not found" } });
                }
            }

            // 3. Update the LAST message in history with the tool responses
            // We mutate the chat state in React to show the result in the same bubble or sequence
            const historyWithResponses = updatedHistoryWithCall.map(msg => {
                if (msg.id === toolCallMsg.id) {
                    return { ...msg, toolResponses };
                }
                return msg;
            });
            setHistory(historyWithResponses);
            currentHistory = historyWithResponses; // Update local ref for next loop

            // 4. Send results back to Gemini
            const nextResponse = await sendToolResponseToGemini(chat, toolResponses);
            currentResponse = nextResponse;
            loopCount++;
        } else {
            // No tool calls, just final text
            // If we already added a message for tool calls (e.g. text + tool), we might need to append a new message
            // But usually, if it's just text, it's the final answer.
            
            // Note: If the previous loop iteration created a message (Tool Use), the model's *next* response is the interpretation of that tool use.
            // So we add a NEW message for the interpretation.
            
            const finalMsg: ChatMessage = {
                id: uuidv4(),
                role: MessageRole.MODEL,
                content: textParts,
                timestamp: Date.now()
            };
            
            setHistory(prev => [...prev, finalMsg]);
            break; // Done
        }
    }

    setIsLoading(false);
  };

  const addTool = () => {
    const newTool: MCPTool = {
      id: uuidv4(),
      name: 'new_tool_' + Math.floor(Math.random() * 1000),
      description: 'Description of the new tool',
      parameters: JSON.stringify({
        type: "OBJECT",
        properties: {
          arg1: { type: "STRING" }
        }
      }, null, 2),
      implementation: `return { message: "Hello " + args.arg1 };`,
      enabled: true
    };
    setTools([...tools, newTool]);
  };

  const updateTool = (updatedTool: MCPTool) => {
    setTools(tools.map(t => t.id === updatedTool.id ? updatedTool : t));
  };

  const deleteTool = (id: string) => {
    setTools(tools.filter(t => t.id !== id));
  };

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden font-sans">
      {/* Mobile Sidebar Toggle */}
      {!isSidebarOpen && (
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden absolute top-4 left-4 z-20 p-2 bg-gray-800 rounded text-gray-300 shadow-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
      )}

      <Sidebar 
        tools={tools}
        onAddTool={addTool}
        onUpdateTool={updateTool}
        onDeleteTool={deleteTool}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <div className="flex-1 h-full relative">
        <ChatArea 
          history={history}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
};

export default App;
