
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '../types';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-[650px] bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden shadow-2xl shadow-slate-200/50">
      <div className="p-6 bg-white border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white mr-4 shadow-sm">
            <Bot size={22} />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 tracking-tight">Strategic Concierge</h3>
            <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">Active Consultation</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
           <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Consultancy Online</span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-10">
            <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-300 mb-6">
              <MessageSquare size={32} />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">How can I optimize your portfolio today?</h4>
            <p className="text-sm text-slate-400 max-w-xs">Ask about debt restructuring, savings targets, or market educational concepts.</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end`}>
              <div className={`p-5 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                ? 'bg-slate-900 text-white rounded-br-none shadow-lg font-medium' 
                : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
              }`}>
                {msg.role === 'assistant' ? (
                  <div className="prose prose-slate max-w-none prose-sm">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-3 bg-white border border-slate-100 p-4 rounded-2xl rounded-bl-none shadow-sm">
              <Loader2 className="animate-spin text-indigo-600" size={16} />
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Analyzing Portfolio...</span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6 bg-white border-t border-slate-100">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your financial query..."
            className="w-full pl-6 pr-16 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all text-sm font-semibold text-slate-900 placeholder-slate-400 shadow-inner"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            className="absolute right-3 p-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-[10px] text-center text-slate-400 font-medium mt-4 tracking-tight">AI consultation for educational purposes. Always consult local fiduciary standards.</p>
      </form>
    </div>
  );
};

export default ChatInterface;
