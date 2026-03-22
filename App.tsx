
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  User, FinancialProfile, HealthScore, Recommendation, 
  ProjectionData, ChatMessage, EmploymentType, JobStability,
  RiskAppetite, InvestmentKnowledge, RoadmapItem 
} from './types';
import { storageService } from './services/storageService';
import { financialEngine } from './services/financialEngine';
import { geminiService } from './services/geminiService';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import { 
  LogOut, LayoutDashboard, MessageSquare, PieChart, 
  Settings, Loader2, Info, ChevronRight, CheckCircle, ChevronLeft,
  User as UserIcon, Shield, BarChart3, Zap, ArrowRight
} from 'lucide-react';
import ConversationalOnboarding from './components/ConversationalOnboarding';

const App: React.FC = () => {
  const [showLanding, setShowLanding] = useState(!storageService.getUser());
  const [user, setUser] = useState<User | null>(storageService.getUser());
  const [profile, setProfile] = useState<FinancialProfile | null>(storageService.getProfile());
  const [recommendations, setRecommendations] = useState<Recommendation[]>(storageService.getRecommendations());
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>(storageService.getRoadmap());
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(storageService.getChatHistory());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat'>('dashboard');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const healthScore = useMemo(() => profile ? financialEngine.calculateHealthScore(profile) : null, [profile]);
  const projections = useMemo(() => profile ? financialEngine.generateProjections(profile) : [], [profile]);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newUser = { id: 'u1', email: 'advisor@finai.com', name: 'John Doe', onboarded: !!storageService.getProfile() };
    setUser(newUser);
    storageService.setUser(newUser);
    setShowLanding(false);
  };

  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (profile) {
      storageService.setProfile(profile);
      const score = financialEngine.calculateHealthScore(profile);
      const { recommendations: recs } = await geminiService.analyzeProfile(profile, score);
      setRecommendations(recs);
      storageService.setRecommendations(recs);
      
      const updatedUser = { ...user!, onboarded: true };
      setUser(updatedUser);
      storageService.setUser(updatedUser);
    }
    setLoading(false);
  };

  const handleRecommendationAction = (id: string, status: Recommendation['status']) => {
    const updated = recommendations.map(r => r.id === id ? { ...r, status } : r);
    setRecommendations(updated);
    storageService.setRecommendations(updated);
  };

  const handleSendMessage = async (text: string) => {
    if (!profile) return;
    
    const userMsg: ChatMessage = { id: `msg-${Date.now()}`, role: 'user', content: text, timestamp: Date.now() };
    const newHistory = [...chatHistory, userMsg];
    setChatHistory(newHistory);
    storageService.setChatHistory(newHistory);
    
    setLoading(true);
    const aiResponse = await geminiService.chat(text, profile, newHistory);
    const aiMsg: ChatMessage = { id: `msg-${Date.now()+1}`, role: 'assistant', content: aiResponse, timestamp: Date.now() };
    
    const finalHistory = [...newHistory, aiMsg];
    setChatHistory(finalHistory);
    storageService.setChatHistory(finalHistory);
    setLoading(false);
  };

  const logout = () => {
    storageService.clearAll();
    setUser(null);
    setProfile(null);
    setRecommendations([]);
    setRoadmap([]);
    setChatHistory([]);
    setShowLanding(true);
    // Force clean navigation state
    window.location.href = window.location.pathname;
  };

  const updateProfile = (updates: Partial<FinancialProfile>) => {
    setProfile(prev => {
      const base = prev || { 
        age: 30, country: 'India', dependents: 0, monthlyIncome: 50000, 
        employmentType: EmploymentType.SALARIED, jobStability: JobStability.MEDIUM,
        fixedExpenses: 20000, variableExpenses: 10000, currentSavings: 100000,
        totalDebt: 0, avgInterestRate: 0, riskAppetite: RiskAppetite.MODERATE,
        investmentKnowledge: InvestmentKnowledge.BEGINNER, primaryGoal: 'Wealth Creation',
        timeHorizon: 15
      };
      return { ...base, ...updates } as FinancialProfile;
    });
  };

  // Landing Page View
  if (showLanding && !user) {
    return (
      <div className="min-h-screen bg-white font-['Inter']">
        <nav className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
              <PieChart size={24} />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">FinAI Strategic</span>
          </div>
          <button 
            onClick={() => setShowLanding(false)}
            className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-md"
          >
            Access Terminal
          </button>
        </nav>

        <main className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-bold tracking-wide uppercase">
                <Zap size={14} className="mr-2" /> Powered by Gemini 3 Pro
              </div>
              <h1 className="text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
                Your Wealth, <br />
                <span className="text-indigo-600">Scientifically Optimized.</span>
              </h1>
              <p className="text-xl text-slate-500 leading-relaxed max-w-lg">
                Elite AI financial consultancy that learns your behavior, predicts your future, and secures your legacy. Professional grade tools for the modern investor.
              </p>
              <div className="flex space-x-4 pt-4">
                <button 
                  onClick={() => setShowLanding(false)}
                  className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center group shadow-xl hover:bg-slate-800 transition-all"
                >
                  Start Professional Onboarding
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-indigo-500/10 blur-[100px] rounded-full"></div>
              <div className="relative bg-slate-50 border border-slate-200 rounded-[3rem] p-4 shadow-2xl">
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm">
                   <div className="flex justify-between items-center mb-8">
                      <div className="h-4 w-32 bg-slate-100 rounded"></div>
                      <div className="h-8 w-8 bg-indigo-600 rounded-lg"></div>
                   </div>
                   <div className="space-y-4">
                      <div className="h-40 bg-slate-50 rounded-3xl overflow-hidden relative">
                         <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-indigo-500/20"></div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="h-12 bg-slate-50 rounded-xl"></div>
                        <div className="h-12 bg-slate-50 rounded-xl"></div>
                        <div className="h-12 bg-slate-50 rounded-xl"></div>
                      </div>
                      <div className="h-24 bg-slate-900 rounded-2xl"></div>
                   </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-32">
            <div className="space-y-4">
              <div className="p-3 bg-slate-100 w-fit rounded-xl text-slate-900"><Shield size={24} /></div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Enterprise Security</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Financial data is stored locally and processed using top-tier encrypted LLM instances.</p>
            </div>
            <div className="space-y-4">
              <div className="p-3 bg-slate-100 w-fit rounded-xl text-slate-900"><BarChart3 size={24} /></div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Future Forecasting</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Proprietary simulation engines predict your net worth up to 24 months in advance.</p>
            </div>
            <div className="space-y-4">
              <div className="p-3 bg-slate-100 w-fit rounded-xl text-slate-900"><Zap size={24} /></div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Strategic Advisory</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Actionable, multi-priority recommendations tailored to your risk appetite and goals.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg">
              <PieChart size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Security Access</h1>
            <p className="text-slate-400 font-medium">Please authenticate to continue</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Access Email</label>
              <input 
                type="email" 
                defaultValue="advisor@finai.com" 
                required 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all text-slate-900 font-medium bg-slate-50" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Passphrase</label>
              <input 
                type="password" 
                defaultValue="password" 
                required 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all text-slate-900 font-medium bg-slate-50" 
              />
            </div>
            <button type="submit" className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all">Authenticate Terminal</button>
          </form>
          <button 
            onClick={() => setShowLanding(true)}
            className="w-full mt-4 text-slate-400 hover:text-slate-600 text-xs font-bold transition-colors"
          >
            Return to Landing
          </button>
        </div>
      </div>
    );
  }

  if (!user.onboarded) {
    return (
      <ConversationalOnboarding 
        userName={user.name} 
        onComplete={async (finalProfile) => {
          setLoading(true);
          setProfile(finalProfile);
          storageService.setProfile(finalProfile);
          
          const score = financialEngine.calculateHealthScore(finalProfile);
          const { recommendations: recs, roadmap: newRoadmap } = await geminiService.analyzeProfile(finalProfile, score);
          
          setRecommendations(recs);
          storageService.setRecommendations(recs);
          setRoadmap(newRoadmap);
          storageService.setRoadmap(newRoadmap);
          
          const updatedUser = { ...user!, onboarded: true };
          setUser(updatedUser);
          storageService.setUser(updatedUser);
          setLoading(false);
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen flex bg-white font-['Inter']">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-100 flex flex-col fixed inset-y-0 z-50 bg-slate-50">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-12">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-sm">
              <PieChart size={24} />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">FinAI Strategic</span>
          </div>
          
          <nav className="space-y-1.5">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-white text-slate-900 font-bold shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-900 hover:bg-white'}`}
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </button>
            <button 
              onClick={() => setActiveTab('chat')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'chat' ? 'bg-white text-slate-900 font-bold shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-900 hover:bg-white'}`}
            >
              <MessageSquare size={20} />
              <span>AI Consultancy</span>
            </button>
          </nav>
        </div>
        
        <div className="mt-auto p-6 space-y-4">
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                <UserIcon size={16} />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold truncate text-slate-900">{user.name}</p>
                <p className="text-[10px] text-slate-500 font-medium truncate uppercase tracking-tighter">{profile?.country || 'N/A'}</p>
              </div>
            </div>
            <button onClick={logout} className="w-full flex items-center justify-center space-x-2 text-slate-400 hover:text-red-500 text-xs font-bold py-1 transition-colors">
              <LogOut size={14} />
              <span>Terminate Session</span>
            </button>
          </div>
          <div className="bg-slate-900 p-5 rounded-2xl text-white shadow-sm">
            <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mb-1">Portfolio Wellness</p>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold tracking-tight">{healthScore?.score}</span>
              <span className="text-[10px] font-bold bg-indigo-500/20 px-2 py-1 rounded text-indigo-300">STABLE</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-10 overflow-y-auto">
        <header className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {activeTab === 'dashboard' ? 'Portfolio Overview' : 'AI Consultancy'}
            </h1>
            <p className="text-slate-500 mt-1 font-medium italic">Intelligent analysis for {user.name.split(' ')[0]}.</p>
          </div>
          <div className="flex space-x-4">
             <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
                <Info size={14} className="mr-2 text-indigo-500" />
                <span>Cycle Audit: active</span>
             </div>
          </div>
        </header>

        {activeTab === 'dashboard' ? (
          <Dashboard 
            profile={profile!} 
            score={healthScore!} 
            recommendations={recommendations}
            roadmap={roadmap}
            projections={projections}
            onAction={handleRecommendationAction}
          />
        ) : (
          <div className="max-w-4xl mx-auto">
             <ChatInterface 
               messages={chatHistory} 
               onSendMessage={handleSendMessage} 
               isLoading={loading} 
             />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
