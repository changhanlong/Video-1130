
import React, { useState, useEffect, useRef } from 'react';
import { AgentRole, AGENTS, Message } from '../types';
import { Send, Sparkles, User, RefreshCw, MessageSquare } from 'lucide-react';

interface Props {
  activeAgent: AgentRole;
  onAgentSelect: (role: AgentRole) => void;
  messages: Message[];
  onSendMessage: (message: string, agent: AgentRole) => void;
  isProcessing: boolean;
  mode?: 'discussion' | 'edit'; 
}

const CrewPanel: React.FC<Props> = ({ activeAgent, onAgentSelect, messages, onSendMessage, isProcessing, mode = 'edit' }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (isProcessing) return;
    // Allow empty input if we just want to nudge an agent to speak
    onSendMessage(input, activeAgent);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 border-l border-gray-750 shadow-2xl w-full">
      {/* Agent Selector / Team Header */}
      <div className="p-4 border-b border-gray-800 bg-gray-900 shadow-sm z-10">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
            {mode === 'discussion' ? '点击头像指定专家发言 (Select to Speak)' : '指定专家修改 (Refine)'}
        </h3>
        
        <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
          {Object.values(AGENTS).map((agent) => (
            <button
              key={agent.id}
              onClick={() => onAgentSelect(agent.id)}
              className={`flex-shrink-0 relative group p-1.5 rounded-xl transition-all border ${
                activeAgent === agent.id 
                  ? `${agent.bgColor} border-${agent.color.split('-')[1]}-500/50 ring-1 ring-${agent.color.split('-')[1]}-500 scale-105` 
                  : 'bg-gray-800 border-gray-700 hover:border-gray-600 opacity-60 hover:opacity-100'
              }`}
            >
              <img 
                src={agent.avatar} 
                alt={agent.name} 
                className={`w-10 h-10 rounded-lg object-cover bg-gray-700 ${activeAgent !== agent.id ? 'grayscale' : ''}`} 
              />
              {activeAgent === agent.id && (
                <div className="absolute -bottom-1 -right-1 bg-gray-900 rounded-full p-0.5 border border-gray-700">
                    <div className={`w-2 h-2 rounded-full bg-${agent.color.split('-')[1]}-500 animate-pulse`} />
                </div>
              )}
            </button>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 animate-fadeIn">
            <div className="flex items-center justify-between">
                <h4 className="text-white font-bold text-sm">{AGENTS[activeAgent].name}</h4>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-gray-800 ${AGENTS[activeAgent].color}`}>
                    {AGENTS[activeAgent].role}
                </span>
            </div>
            <p className="text-gray-400 text-xs mt-1 leading-snug">{AGENTS[activeAgent].expertise}</p>
        </div>
      </div>

      {/* Chat History */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-950/50 scroll-smooth">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-600">
            <MessageSquare className="w-10 h-10 mb-3 opacity-20" />
            <p className="text-sm">会议室准备就绪...</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isModel = msg.role === 'model';
            const agent = msg.agentId ? AGENTS[msg.agentId] : null;
            
            return (
              <div key={msg.id || idx} className={`flex ${!isModel ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                 {/* Avatar for Model */}
                 {isModel && agent && (
                    <div className="flex-shrink-0 mr-3 mt-1">
                        <img src={agent.avatar} className="w-8 h-8 rounded-full border border-gray-700" title={agent.name} />
                    </div>
                 )}

                <div className={`max-w-[85%] ${isModel ? '' : 'bg-brand-600 text-white rounded-2xl rounded-br-none p-3 shadow-lg'}`}>
                  {isModel && agent ? (
                      <div className="bg-gray-800 border border-gray-700 rounded-2xl rounded-tl-none p-4 shadow-sm">
                          <div className={`text-xs font-bold mb-1 ${agent.color} flex items-center`}>
                              {agent.role}
                              <span className="ml-2 text-gray-500 font-normal opacity-50">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                          <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                      </div>
                  ) : (
                      <div className="text-sm">{msg.content}</div>
                  )}
                </div>
              </div>
            );
          })
        )}
        
        {isProcessing && (
           <div className="flex justify-start animate-pulse">
              <div className="flex-shrink-0 mr-3 mt-1 w-8 h-8 bg-gray-800 rounded-full"></div>
              <div className="bg-gray-800 rounded-2xl p-3 border border-gray-700 flex items-center space-x-2">
                 <RefreshCw className="w-3 h-3 animate-spin text-gray-400" />
                 <span className="text-xs text-gray-400">正在思考/发言...</span>
              </div>
           </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gray-900 border-t border-gray-800">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
                mode === 'discussion' 
                ? `邀请 ${AGENTS[activeAgent].name} 发言，或直接输入您的想法...` 
                : `向 ${AGENTS[activeAgent].name} 提修改建议 (如: 调整 #3 镜头的画面)`
            }
            disabled={isProcessing}
            rows={2}
            className="w-full bg-gray-950 text-white rounded-xl border border-gray-700 p-3 pr-12 focus:ring-2 focus:ring-brand-500 outline-none resize-none text-sm shadow-inner placeholder-gray-600"
          />
          <button
            onClick={handleSend}
            disabled={isProcessing} // Allow empty input to just nudge
            className="absolute right-2 bottom-2 p-2 bg-brand-600 hover:bg-brand-500 disabled:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CrewPanel;
