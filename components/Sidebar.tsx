import React, { useState } from 'react';
import { MCPTool } from '../types';

interface SidebarProps {
  tools: MCPTool[];
  onUpdateTool: (tool: MCPTool) => void;
  onAddTool: () => void;
  onDeleteTool: (id: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ tools, onUpdateTool, onAddTool, onDeleteTool, isOpen, setIsOpen }) => {
  const [editingToolId, setEditingToolId] = useState<string | null>(null);

  const handleEdit = (id: string) => {
    if (editingToolId === id) setEditingToolId(null);
    else setEditingToolId(id);
  };

  const ToolEditor = ({ tool }: { tool: MCPTool }) => {
    const [localTool, setLocalTool] = useState(tool);

    const handleChange = (field: keyof MCPTool, value: any) => {
      setLocalTool(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
      onUpdateTool(localTool);
      setEditingToolId(null);
    };

    return (
      <div className="bg-gray-800 p-3 rounded mt-2 border border-gray-700 animate-fadeIn">
        <div className="mb-2">
          <label className="text-xs text-gray-400 uppercase font-bold">Name</label>
          <input 
            type="text" 
            value={localTool.name} 
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 text-white text-sm rounded p-1 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="mb-2">
          <label className="text-xs text-gray-400 uppercase font-bold">Description</label>
          <input 
            type="text" 
            value={localTool.description} 
            onChange={(e) => handleChange('description', e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 text-white text-sm rounded p-1 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="mb-2">
          <label className="text-xs text-gray-400 uppercase font-bold">Parameters (JSON Schema)</label>
          <textarea 
            value={localTool.parameters} 
            onChange={(e) => handleChange('parameters', e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 text-gray-300 text-xs rounded p-1 font-mono h-24 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="mb-2">
          <label className="text-xs text-gray-400 uppercase font-bold">Implementation (JS Body)</label>
          <textarea 
            value={localTool.implementation} 
            onChange={(e) => handleChange('implementation', e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 text-amber-200 text-xs rounded p-1 font-mono h-32 focus:outline-none focus:border-amber-500"
            placeholder="return { ... }"
          />
          <p className="text-[10px] text-gray-500 mt-1">Available: <code>args</code>. Return JSON serializable object.</p>
        </div>
        <div className="flex justify-end gap-2 mt-3">
           <button onClick={() => onDeleteTool(tool.id)} className="text-xs text-red-400 hover:text-red-300 mr-auto">Delete</button>
           <button onClick={() => setEditingToolId(null)} className="text-xs text-gray-400 hover:text-white">Cancel</button>
           <button onClick={handleSave} className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded">Save</button>
        </div>
      </div>
    );
  };

  return (
    <div className={`fixed inset-y-0 left-0 transform ${isOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out z-30 w-80 bg-gray-900 border-r border-gray-800 flex flex-col h-full shadow-xl`}>
       <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-950">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
             <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
             MCP Tools
          </h2>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
       </div>

       <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {tools.map(tool => (
             <div key={tool.id} className={`rounded-lg border transition-all ${tool.enabled ? 'border-gray-700 bg-gray-800/50' : 'border-gray-800 bg-gray-900/50 opacity-75'}`}>
                <div className="p-3 flex items-start justify-between">
                   <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm text-white truncate" title={tool.name}>{tool.name}</h3>
                        <span className={`w-2 h-2 rounded-full ${tool.enabled ? 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]' : 'bg-gray-600'}`}></span>
                      </div>
                      <p className="text-xs text-gray-400 truncate mt-1">{tool.description}</p>
                   </div>
                   <div className="flex items-center gap-1 ml-2">
                      <button 
                        onClick={() => onUpdateTool({...tool, enabled: !tool.enabled})}
                        className={`p-1.5 rounded hover:bg-gray-700 text-gray-400 transition-colors`}
                        title={tool.enabled ? "Disable" : "Enable"}
                      >
                        <svg className={`w-4 h-4 ${tool.enabled ? 'text-emerald-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                      </button>
                      <button 
                        onClick={() => handleEdit(tool.id)}
                        className="p-1.5 rounded hover:bg-gray-700 text-gray-400"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                      </button>
                   </div>
                </div>
                {editingToolId === tool.id && (
                  <div className="px-2 pb-2">
                    <ToolEditor tool={tool} />
                  </div>
                )}
             </div>
          ))}

          {tools.length === 0 && (
             <div className="text-center py-8 text-gray-500 text-sm">
                No tools configured.
             </div>
          )}
       </div>

       <div className="p-4 border-t border-gray-800 bg-gray-950">
          <button 
             onClick={onAddTool}
             className="w-full flex justify-center items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded border border-gray-700 transition-all"
          >
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
             Add New Tool
          </button>
       </div>
    </div>
  );
};

export default Sidebar;
