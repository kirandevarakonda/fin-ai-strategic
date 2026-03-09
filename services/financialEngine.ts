
import { FinancialProfile, HealthScore, ProjectionData } from '../types';

export const financialEngine = {
  calculateHealthScore: (profile: FinancialProfile): HealthScore => {
    const monthlySurplus = profile.monthlyIncome - (profile.fixedExpenses + profile.variableExpenses);
    const savingsRate = Math.max(0, (monthlySurplus / profile.monthlyIncome) * 100);
    const debtRatio = profile.monthlyIncome > 0 ? (profile.totalDebt / (profile.monthlyIncome * 12)) : 1;
    const expenseRatio = (profile.fixedExpenses + profile.variableExpenses) / profile.monthlyIncome;

    // Scores 0-100
    const savingsScore = Math.min(100, savingsRate * 2.5); // 40% savings rate is perfect
    const debtScore = Math.max(0, 100 - (debtRatio * 50)); // Debt > 2x annual income is very bad
    const expenseScore = Math.max(0, 100 - (expenseRatio * 100)); // Lower ratio is better
    const stabilityMap = { Low: 30, Medium: 70, High: 100 };
    const stabilityScore = stabilityMap[profile.jobStability as keyof typeof stabilityMap] || 50;

    const finalScore = Math.round(
      (savingsScore * 0.35) + 
      (debtScore * 0.25) + 
      (expenseScore * 0.25) + 
      (stabilityScore * 0.15)
    );

    let explanation = "";
    if (finalScore > 80) explanation = "Excellent financial health! You have strong savings and controlled debt.";
    else if (finalScore > 60) explanation = "Good standing, but there's room to optimize your surplus or reduce liabilities.";
    else if (finalScore > 40) explanation = "Fair. We need to focus on building an emergency fund and managing debt strictly.";
    else explanation = "Critical attention needed. Your expenses and debt are high relative to your income stability.";

    return {
      score: finalScore,
      breakdown: {
        savingsRate: Math.round(savingsRate),
        debtBurden: Math.round(debtRatio * 100),
        expenseControl: Math.round(expenseRatio * 100),
        stability: stabilityScore
      },
      aiExplanation: explanation
    };
  },

  generateProjections: (profile: FinancialProfile, months: number = 24): ProjectionData[] => {
    const monthlySurplus = profile.monthlyIncome - (profile.fixedExpenses + profile.variableExpenses);
    const data: ProjectionData[] = [];
    
    let currentBalance = profile.currentSavings;
    let advisedBalance = profile.currentSavings;
    
    // Assume advised path saves 15% more by optimizing variable expenses
    const optimizedSurplus = monthlySurplus + (profile.variableExpenses * 0.15);

    for (let i = 0; i <= months; i++) {
      data.push({
        month: i,
        currentPath: Math.round(currentBalance),
        advisedPath: Math.round(advisedBalance)
      });
      
      // Simple monthly growth (approx 0.3% for savings account)
      currentBalance = (currentBalance + monthlySurplus) * 1.003;
      advisedBalance = (advisedBalance + optimizedSurplus) * 1.003;
    }
    
    return data;
  }
};
