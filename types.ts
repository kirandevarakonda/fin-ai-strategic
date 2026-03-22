
export enum EmploymentType {
  STUDENT = 'Student',
  SALARIED = 'Salaried',
  SELF_EMPLOYED = 'Self-employed',
  FREELANCER = 'Freelancer'
}

export enum JobStability {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export enum RiskAppetite {
  CONSERVATIVE = 'Conservative',
  MODERATE = 'Moderate',
  AGGRESSIVE = 'Aggressive'
}

export enum InvestmentKnowledge {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  EXPERT = 'Expert'
}

export interface User {
  id: string;
  email: string;
  name: string;
  onboarded: boolean;
}

export interface FinancialProfile {
  age: number;
  country: string;
  dependents: number;
  monthlyIncome: number;
  employmentType: EmploymentType;
  jobStability: JobStability;
  fixedExpenses: number;
  variableExpenses: number;
  currentSavings: number;
  totalDebt: number;
  avgInterestRate: number;
  riskAppetite: RiskAppetite;
  investmentKnowledge: InvestmentKnowledge;
  primaryGoal: string;
  timeHorizon: number; // years
}

export interface HealthScore {
  score: number;
  breakdown: {
    savingsRate: number;
    debtBurden: number;
    expenseControl: number;
    stability: number;
  };
  aiExplanation: string;
}

export interface Recommendation {
  id: string;
  title: string;
  advice: string;
  reason: string;
  priority: 'low' | 'medium' | 'high';
  impact: string;
  status: 'pending' | 'applied' | 'ignored' | 'remind_later';
}

export interface RoadmapItem {
  quarter: string;
  objective: string;
  actions: string[];
  expectedImpact: string;
}

export interface ProjectionData {
  month: number;
  currentPath: number;
  advisedPath: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
