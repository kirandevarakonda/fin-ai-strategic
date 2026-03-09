
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  User, FinancialProfile, HealthScore, Recommendation, 
  ProjectionData, ChatMessage, EmploymentType, JobStability,
  RiskAppetite, InvestmentKnowledge 
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

const App: React.FC = () => {
  const [showLanding, setShowLanding] = useState(!storageService.getUser());
  const [user, setUser] = useState<User | null>(storageService.getUser());
  const [profile, setProfile] = useState<FinancialProfile | null>(storageService.getProfile());
  const [recommendations, setRecommendations] = useState<Recommendation[]>(storageService.getRecommendations());
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
      <div className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 p-8 text-white">
            <h2 className="text-2xl font-bold mb-2">Wealth Profiling</h2>
            <p className="text-slate-400 font-medium">Precision analysis requires detailed context.</p>
            <div className="mt-6 flex gap-2">
              {[1, 2, 3, 4, 5].map(s => (
                <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= step ? 'bg-indigo-500' : 'bg-slate-700'}`} />
              ))}
            </div>
          </div>
          
          <div className="p-8">
            <form onSubmit={step === 5 ? handleOnboardingSubmit : (e) => { e.preventDefault(); setStep(s => s + 1); }}>
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">1. Strategic Context</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-2 uppercase tracking-wide">Age</label>
                      <input 
                        type="number" 
                        onChange={e => updateProfile({ age: parseInt(e.target.value) })} 
                        placeholder="30" 
                        required 
                        className="w-full p-3 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-slate-900 focus:outline-none bg-slate-50 placeholder-slate-300" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-2 uppercase tracking-wide">Country</label>
                      <input 
                        type="text" 
                        defaultValue={profile?.country || 'India'} 
                        onChange={e => updateProfile({ country: e.target.value })} 
                        placeholder="e.g. India" 
                        required 
                        className="w-full p-3 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-slate-900 focus:outline-none bg-slate-50 placeholder-slate-300" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2 uppercase tracking-wide">Dependents</label>
                    <input 
                      type="number" 
                      onChange={e => updateProfile({ dependents: parseInt(e.target.value) })} 
                      placeholder="0" 
                      required 
                      className="w-full p-3 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-slate-900 focus:outline-none bg-slate-50 placeholder-slate-300" 
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">2. Professional Status</h3>
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2 uppercase tracking-wide">Monthly Net Income (₹/$)</label>
                    <input 
                      type="number" 
                      onChange={e => updateProfile({ monthlyIncome: parseInt(e.target.value) })} 
                      placeholder="50000" 
                      required 
                      className="w-full p-3 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-slate-900 focus:outline-none bg-slate-50 placeholder-slate-300" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-2 uppercase tracking-wide">Employment</label>
                      <select onChange={e => updateProfile({ employmentType: e.target.value as EmploymentType })} className="w-full p-3 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-slate-900 focus:outline-none bg-slate-50">
                        {Object.values(EmploymentType).map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-2 uppercase tracking-wide">Job Stability</label>
                      <select onChange={e => updateProfile({ jobStability: e.target.value as JobStability })} className="w-full p-3 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-slate-900 focus:outline-none bg-slate-50">
                        {Object.values(JobStability).map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">3. Capital Distribution</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-2 uppercase tracking-wide">Fixed Expenses</label>
                      <input 
                        type="number" 
                        onChange={e => updateProfile({ fixedExpenses: parseInt(e.target.value) })} 
                        placeholder="20000" 
                        required 
                        className="w-full p-3 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-slate-900 focus:outline-none bg-slate-50 placeholder-slate-300" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-2 uppercase tracking-wide">Variable Expenses</label>
                      <input 
                        type="number" 
                        onChange={e => updateProfile({ variableExpenses: parseInt(e.target.value) })} 
                        placeholder="10000" 
                        required 
                        className="w-full p-3 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-slate-900 focus:outline-none bg-slate-50 placeholder-slate-300" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2 uppercase tracking-wide">Outstanding Liability</label>
                    <input 
                      type="number" 
                      onChange={e => updateProfile({ totalDebt: parseInt(e.target.value) })} 
                      placeholder="0" 
                      required 
                      className="w-full p-3 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-slate-900 focus:outline-none bg-slate-50 placeholder-slate-300" 
                    />
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">4. Risk Management</h3>
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2 uppercase tracking-wide">Risk Tolerance</label>
                    <select onChange={e => updateProfile({ riskAppetite: e.target.value as RiskAppetite })} className="w-full p-3 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-slate-900 focus:outline-none bg-slate-50">
                      {Object.values(RiskAppetite).map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2 uppercase tracking-wide">Market Knowledge</label>
                    <select onChange={e => updateProfile({ investmentKnowledge: e.target.value as InvestmentKnowledge })} className="w-full p-3 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-slate-900 focus:outline-none bg-slate-50">
                      {Object.values(InvestmentKnowledge).map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">5. Strategic Objectives</h3>
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2 uppercase tracking-wide">Primary Goal</label>
                    <input 
                      type="text" 
                      onChange={e => updateProfile({ primaryGoal: e.target.value })} 
                      placeholder="Wealth Generation" 
                      required 
                      className="w-full p-3 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-slate-900 focus:outline-none bg-slate-50 placeholder-slate-300" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2 uppercase tracking-wide">Time Horizon (Years)</label>
                    <input 
                      type="number" 
                      onChange={e => updateProfile({ timeHorizon: parseInt(e.target.value) })} 
                      placeholder="15" 
                      required 
                      className="w-full p-3 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-slate-900 focus:outline-none bg-slate-50 placeholder-slate-300" 
                    />
                  </div>
                </div>
              )}

              <div className="mt-10 flex gap-4">
                {step > 1 && (
                  <button type="button" onClick={() => setStep(s => s - 1)} className="flex-1 flex items-center justify-center p-4 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all">
                    <ChevronLeft size={20} className="mr-1" /> Back
                  </button>
                )}
                <button type="submit" disabled={loading} className="flex-[2] flex items-center justify-center p-4 bg-slate-900 text-white rounded-xl font-bold shadow-md hover:bg-slate-800 disabled:opacity-50 transition-all">
                  {loading ? <Loader2 className="animate-spin" /> : step === 5 ? 'Execute Analysis' : 'Next Cycle'} 
                  {!loading && <ChevronRight size={20} className="ml-1" />}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
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
