import React, { useRef, useEffect, useState } from 'react';
import { ChatMessage, MessageRole } from '../types';
import MessageBubble from './MessageBubble';

interface ChatAreaProps {
  history: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({ history, isLoading, onSendMessage }) => {
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 relative">
       {/* Messages Area */}
       <div className="flex-1 overflow-y-auto p-4 pb-32">
          <div className="max-w-3xl mx-auto mt-8 text-center mb-12">
             <h1 className="text-2xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">MCP Studio</h1>
             <p className="text-gray-500 text-sm">Configure tools in the sidebar. I can use them to solve tasks.</p>
          </div>
          
          {history.map((msg) => (
             <MessageBubble key={msg.id} message={msg} />
          ))}
          
          {isLoading && (
             <div className="flex flex-col gap-2 w-full max-w-3xl mx-auto px-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">AI</div>
                  <span className="text-xs text-gray-500 font-medium">Gemini</span>
                </div>
                <div className="ml-8 flex items-center gap-2">
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
             </div>
          )}
          
          <div ref={endRef} />
       </div>

       {/* Input Area */}
       <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-950 via-gray-950 to-transparent">
          <div className="max-w-3xl mx-auto bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/50 transition-all">
             <form onSubmit={handleSubmit} className="flex flex-col">
                <textarea
                   value={input}
                   onChange={(e) => setInput(e.target.value)}
                   onKeyDown={handleKeyDown}
                   placeholder="Type a message... (e.g. 'What is the weather in Tokyo?')"
                   className="w-full bg-transparent text-white p-4 focus:outline-none resize-none max-h-48"
                   rows={1}
                   style={{ minHeight: '3.5rem' }}
                />
                <div className="flex justify-between items-center px-4 pb-3 bg-gray-800">
                   <div className="text-xs text-gray-500 flex items-center gap-2">
                      <span className="bg-gray-700 px-2 py-0.5 rounded text-[10px]">Gemini 2.5 Flash</span>
                   </div>
                   <button 
                      type="submit" 
                      disabled={!input.trim() || isLoading}
                      className={`p-2 rounded-lg transition-all ${
                         input.trim() && !isLoading 
                            ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20' 
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      }`}
                   >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                   </button>
                </div>
             </form>
          </div>
          <div className="text-center mt-2">
             <p className="text-[10px] text-gray-600">Use the sidebar to configure MCP tools. Executed in browser sandbox.</p>
          </div>
       </div>
    </div>
  );
};

export default ChatArea;
