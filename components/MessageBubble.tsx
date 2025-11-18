import React from 'react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, MessageRole } from '../types';

interface MessageBubbleProps {
  message: ChatMessage;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === MessageRole.USER;

  return (
    <div className={`flex flex-col gap-2 w-full max-w-3xl mx-auto animate-fadeIn mb-6 px-4`}>
      
      {/* Header */}
      <div className={`flex items-center gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isUser ? 'bg-blue-600 text-white' : 'bg-indigo-600 text-white'}`}>
          {isUser ? 'U' : 'AI'}
        </div>
        <span className="text-xs text-gray-500 font-medium">{isUser ? 'You' : 'Gemini'}</span>
      </div>

      {/* Content */}
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        
        {/* Tool Calls Visualization */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="w-full max-w-2xl mb-2 space-y-2">
            {message.toolCalls.map((call, idx) => {
              // Find corresponding response if available
              const response = message.toolResponses?.find(r => r.name === call.name);
              
              return (
                <div key={idx} className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden text-sm">
                  <div className="bg-gray-800 px-3 py-2 flex items-center justify-between border-b border-gray-700">
                     <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        <span className="font-mono text-amber-200 font-bold">{call.name}</span>
                     </div>
                     <span className="text-xs text-gray-500 font-mono">INVOCATION</span>
                  </div>
                  
                  <div className="p-3 bg-gray-900/50 font-mono text-xs text-gray-300 overflow-x-auto">
                     <span className="text-blue-400">args:</span> {JSON.stringify(call.args, null, 2)}
                  </div>

                  {response && (
                     <>
                      <div className="bg-gray-800/50 px-3 py-1 flex items-center gap-2 border-t border-gray-700/50 border-dashed">
                         <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                         <span className="text-xs text-gray-400 font-mono">RESULT</span>
                      </div>
                      <div className="p-3 bg-gray-950 font-mono text-xs text-emerald-100/80 overflow-x-auto border-t border-gray-700/50">
                         {JSON.stringify(response.response, null, 2)}
                      </div>
                     </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Text Content */}
        {message.content && (
           <div className={`rounded-2xl px-5 py-3 max-w-2xl shadow-sm leading-relaxed prose prose-invert prose-sm max-w-none ${
             isUser 
               ? 'bg-blue-600 text-white rounded-br-none' 
               : 'bg-gray-800 text-gray-100 rounded-bl-none border border-gray-700'
           }`}>
             <ReactMarkdown 
               components={{
                 code({node, className, children, ...props}) {
                   const match = /language-(\w+)/.exec(className || '')
                   return (
                      <code className={`${className} bg-black/30 rounded px-1 py-0.5`} {...props}>
                        {children}
                      </code>
                   )
                 }
               }}
             >
               {message.content}
             </ReactMarkdown>
           </div>
        )}
        
        {message.isError && (
          <div className="mt-2 text-red-400 text-xs flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Error processing message
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;