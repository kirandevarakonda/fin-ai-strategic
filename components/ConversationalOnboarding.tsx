
import React, { useState, useEffect, useRef } from 'react';
import { 
  FinancialProfile, EmploymentType, JobStability, 
  RiskAppetite, InvestmentKnowledge 
} from '../types';
import { geminiService } from '../services/geminiService';
import { 
  Send, User as UserIcon, PieChart, Sparkles, 
  Loader2, CheckCircle2, ArrowRight, ShieldCheck 
} from 'lucide-react';

interface ConversationalOnboardingProps {
  onComplete: (profile: FinancialProfile) => void;
  userName: string;
}

const ConversationalOnboarding: React.FC<ConversationalOnboardingProps> = ({ onComplete, userName }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: `Welcome, ${userName}. I'm your AI Strategic Advisor. To build your optimized financial future, I need to understand your current landscape. Let's start with the basics: What is your current age and which country are you based in?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Partial<FinancialProfile>>({});
  const [isFinishing, setIsFinishing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      // Use Gemini to parse the response and decide the next question
      const result = await geminiService.processOnboardingMessage(userMsg, profile, messages);
      
      if (result.updatedProfile) {
        setProfile(prev => ({ ...prev, ...result.updatedProfile }));
      }

      setMessages(prev => [...prev, { role: 'assistant', content: result.nextMessage }]);
      
      if (result.isComplete) {
        setIsFinishing(true);
        setTimeout(() => {
          onComplete(result.updatedProfile as FinancialProfile);
        }, 2000);
      }
    } catch (error) {
      console.error("Onboarding Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I encountered a slight technical glitch. Could you repeat that or provide more detail?" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 font-['Inter']">
      <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col h-[80vh]">
        {/* Header */}
        <div className="bg-slate-900 p-8 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">AI Onboarding</h2>
              <p className="text-indigo-300/60 text-[10px] font-bold uppercase tracking-widest">Profile Initialization</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center space-x-2">
            {[1, 2, 3, 4].map((s) => (
              <div 
                key={s} 
                className={`w-12 h-1 rounded-full ${Object.keys(profile).length >= s * 3 ? 'bg-indigo-500' : 'bg-slate-700'}`} 
              />
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 scroll-smooth">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
              <div className={`flex max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-3`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-900 text-white shadow-md'}`}>
                  {m.role === 'user' ? <UserIcon size={16} /> : <PieChart size={16} />}
                </div>
                <div className={`p-5 rounded-2xl shadow-sm ${
                  m.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none font-medium' 
                    : 'bg-slate-50 text-slate-800 rounded-bl-none border border-slate-100 leading-relaxed'
                }`}>
                  {m.content}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start animate-in fade-in duration-300">
               <div className="flex items-center space-x-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <Loader2 className="animate-spin text-indigo-500" size={16} />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">AI Thinking...</span>
               </div>
            </div>
          )}
          {isFinishing && (
            <div className="flex flex-col items-center justify-center space-y-4 py-10 animate-in zoom-in duration-700">
               <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-green-500/20">
                  <CheckCircle2 size={40} />
               </div>
               <p className="text-xl font-bold text-slate-900 text-center">Strategic Profile Synthetic Complete</p>
               <p className="text-slate-400 text-sm">Redirecting to Intelligence Terminal...</p>
            </div>
          )}
        </div>

        {/* Footer Input */}
        <div className="p-6 bg-slate-50/50 border-t border-slate-100 shrink-0">
          <form onSubmit={handleSend} className="relative">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading || isFinishing}
              placeholder={loading ? "Synthesizing data..." : "Type your response..."}
              className="w-full py-4 pl-6 pr-16 bg-white border border-slate-200 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm disabled:opacity-50 font-medium placeholder-slate-300"
            />
            <button 
              type="submit" 
              disabled={!input.trim() || loading || isFinishing}
              className="absolute right-2 top-2 bottom-2 w-12 bg-slate-900 text-white rounded-[1.2rem] flex items-center justify-center hover:bg-slate-800 transition-all disabled:opacity-30 disabled:hover:bg-slate-900 shadow-lg"
            >
              <ArrowRight size={20} />
            </button>
          </form>
          <div className="mt-4 flex items-center justify-center space-x-4 opacity-40">
             <div className="flex items-center space-x-1">
                <ShieldCheck size={12} className="text-slate-900" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Encrypted</span>
             </div>
             <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
             <span className="text-[10px] font-bold uppercase tracking-widest">Real-time Analysis</span>
          </div>
        </div>
      </div>
      
      {/* Decorative backdrop elements */}
      <div className="fixed -bottom-32 -left-32 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full -z-10 pointer-events-none"></div>
      <div className="fixed -top-32 -right-32 w-96 h-96 bg-slate-900/5 blur-[120px] rounded-full -z-10 pointer-events-none"></div>
    </div>
  );
};

export default ConversationalOnboarding;
