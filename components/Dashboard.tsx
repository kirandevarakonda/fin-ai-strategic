
import React, { useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from 'recharts';
import { FinancialProfile, HealthScore, Recommendation, ProjectionData, RoadmapItem } from '../types';
import { 
  TrendingUp, TrendingDown, ShieldCheck, AlertCircle, 
  Wallet, PieChart as PieIcon, ArrowRight, CheckCircle2,
  Calendar, Target, Zap, ChevronRight
} from 'lucide-react';

interface DashboardProps {
  profile: FinancialProfile;
  score: HealthScore;
  recommendations: Recommendation[];
  roadmap: RoadmapItem[];
  projections: ProjectionData[];
  onAction: (id: string, status: Recommendation['status']) => void;
}

const COLORS = ['#0f172a', '#6366f1', '#94a3b8', '#f1f5f9'];

const Dashboard: React.FC<DashboardProps> = ({ profile, score, recommendations, roadmap, projections, onAction }) => {
  const currencySymbol = useMemo(() => {
    return profile.country?.toLowerCase() === 'india' ? '₹' : '$';
  }, [profile.country]);

  const formatCurrency = (val: number) => {
    return `${currencySymbol}${val.toLocaleString()}`;
  };

  const pieData = useMemo(() => [
    { name: 'Fixed Assets/Exp', value: profile.fixedExpenses },
    { name: 'Operating Exp', value: profile.variableExpenses },
    { name: 'Capital Surplus', value: Math.max(0, profile.monthlyIncome - profile.fixedExpenses - profile.variableExpenses) },
  ], [profile]);

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <div className="flex justify-between items-start mb-4">
             <div className="p-2 bg-slate-900 text-white rounded-lg"><Wallet size={18} /></div>
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Monthly Cashflow</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{formatCurrency(profile.monthlyIncome)}</p>
        </div>
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <div className="flex justify-between items-start mb-4">
             <div className="p-2 bg-indigo-600 text-white rounded-lg"><ShieldCheck size={18} /></div>
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Wellness Index</span>
          </div>
          <p className="text-3xl font-bold text-indigo-600">{score.score}%</p>
        </div>
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <div className="flex justify-between items-start mb-4">
             <div className="p-2 bg-slate-900 text-white rounded-lg"><TrendingUp size={18} /></div>
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Retention Rate</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{score.breakdown.savingsRate}%</p>
        </div>
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <div className="flex justify-between items-start mb-4">
             <div className="p-2 bg-red-600 text-white rounded-lg"><AlertCircle size={18} /></div>
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Liability Ratio</span>
          </div>
          <p className="text-3xl font-bold text-red-600">{score.breakdown.debtBurden}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Growth Projection */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h3 className="text-xl font-bold text-slate-900 flex items-center">
                Capital Growth Forecast
              </h3>
              <p className="text-sm text-slate-400 mt-1">Simulated performance over 24 financial cycles.</p>
            </div>
            <div className="flex items-center space-x-4">
               <div className="flex items-center space-x-2">
                  <div className="w-3 h-1 bg-indigo-600 rounded"></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Strategic</span>
               </div>
               <div className="flex items-center space-x-2">
                  <div className="w-3 h-1 bg-slate-300 rounded"></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Baseline</span>
               </div>
            </div>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={projections}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" hide />
                <YAxis hide />
                <Tooltip 
                   contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(8px)' }}
                  formatter={(value: any) => [formatCurrency(value as number), '']}
                />
                <Line type="monotone" dataKey="currentPath" stroke="#e2e8f0" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="advisedPath" stroke="#6366f1" strokeWidth={4} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Spending Breakdown */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-8">Asset Distribution</h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => formatCurrency(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4 mt-8">
            {pieData.map((item, i) => (
              <div key={i} className="flex justify-between items-center text-xs">
                <div className="flex items-center">
                  <div className="w-2.5 h-2.5 rounded-full mr-3 shadow-sm" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-slate-500 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Strategic Roadmap */}
      {roadmap && roadmap.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Calendar size={20} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">2026 Strategic Roadmap</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {roadmap.map((item, idx) => (
              <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 text-slate-100 group-hover:text-indigo-50 transition-colors">
                  <Zap size={40} />
                </div>
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-2 block">{item.quarter}</span>
                <h4 className="font-bold text-slate-900 text-sm mb-3 pr-8">{item.objective}</h4>
                <ul className="space-y-2 mb-4">
                  {item.actions.map((action, i) => (
                    <li key={i} className="flex items-start text-[10px] text-slate-500 font-medium">
                      <ChevronRight size={12} className="shrink-0 mt-0.5 mr-1 text-slate-300" />
                      {action}
                    </li>
                  ))}
                </ul>
                <div className="pt-4 border-t border-slate-50 mt-auto">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Impact: <span className="text-slate-900">{item.expectedImpact}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Recommendations */}
      <div className="bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full -mr-32 -mt-32"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-2xl font-bold text-white tracking-tight">AI Tactical Edge</h3>
              <p className="text-indigo-200/60 text-sm mt-1">Immediate action items derived from current landscape analysis.</p>
            </div>
            <button className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest hover:text-indigo-300 transition-colors bg-white/5 px-4 py-2 rounded-xl">View Audit Trail</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendations.filter(r => r.status === 'pending').map((rec) => (
              <div key={rec.id} className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                    rec.priority === 'high' ? 'bg-red-500/20 text-red-400' : 
                    rec.priority === 'medium' ? 'bg-orange-500/20 text-orange-400' : 
                    'bg-indigo-500/20 text-indigo-400'
                  }`}>
                    {rec.priority} Priority
                  </span>
                  <span className="text-[10px] text-white/30 font-bold uppercase tracking-tighter">Impact: {rec.impact}</span>
                </div>
                <h4 className="font-bold text-white text-lg mb-2">{rec.title}</h4>
                <p className="text-sm text-white/60 mb-6 leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all">{rec.advice}</p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => onAction(rec.id, 'applied')}
                    className="flex-1 flex items-center justify-center bg-indigo-600 text-white py-3.5 rounded-2xl text-xs font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/10"
                  >
                    <CheckCircle2 size={14} className="mr-2" />
                    Deploy Strategy
                  </button>
                  <button 
                    onClick={() => onAction(rec.id, 'ignored')}
                    className="px-6 py-3.5 border border-white/10 text-white/40 rounded-2xl text-xs font-bold hover:bg-white/5 transition-all"
                  >
                    Archive
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
