import { useMemo, useState, useEffect } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import { TrendingUp, TrendingDown, Lightbulb, Target, PiggyBank, ShieldCheck, AlertCircle, Sparkles, Loader2 } from "lucide-react";
import { getAIInsights } from "@/services/aiService";

const InsightsPage = () => {
  const { transactions, totalIncome, totalExpenses } = useFinance();
  const [aiInsights, setAiInsights] = useState<{title: string, message: string}[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  useEffect(() => {
    const fetchAI = async () => {
      if (transactions.length > 3) {
        setIsLoadingAI(true);
        const insights = await getAIInsights(transactions, totalIncome, totalExpenses);
        if (insights && insights.length > 0) setAiInsights(insights);
        setIsLoadingAI(false);
      }
    };
    fetchAI();
  }, [transactions.length, totalIncome, totalExpenses]);

  const trends = useMemo(() => {
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthStr = `${previousMonth.getFullYear()}-${String(previousMonth.getMonth() + 1).padStart(2, '0')}`;

    const thisMonth = transactions.filter(t => t.date.startsWith(currentMonthStr));
    const lastMonth = transactions.filter(t => t.date.startsWith(previousMonthStr));
    
    const thisExp = thisMonth.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const lastExp = lastMonth.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const thisInc = thisMonth.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const lastInc = lastMonth.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    
    return { 
        thisExp, lastExp, thisInc, lastInc, 
        expChange: lastExp ? ((thisExp - lastExp) / lastExp * 100) : 0, 
        incChange: lastInc ? ((thisInc - lastInc) / lastInc * 100) : 0 
    };
  }, [transactions]);

  const dynamicTips = useMemo(() => {
    const results = [];
    const savingsRatio = totalIncome > 0 ? (totalIncome - totalExpenses) / totalIncome : 0;
    
    // 1. Savings Rule
    if (savingsRatio < 0.2) {
        results.push({
            icon: PiggyBank,
            title: "Improve Savings Rate",
            message: `Current rate: ${(savingsRatio * 100).toFixed(1)}%. Aim for 20% for long-term growth.`,
            color: "text-destructive",
        });
    } else {
        results.push({
            icon: PiggyBank,
            title: "Great Savings Habit!",
            message: `You're saving ${(savingsRatio * 100).toFixed(1)}%—excellent work!`,
            color: "text-primary",
        });
    }

    // 2. High Category Rule (Updated threshold to 40%)
    const categoryTotals = new Map<string, number>();
    transactions.filter(t => t.type === "expense").forEach(t => categoryTotals.set(t.category, (categoryTotals.get(t.category) || 0) + t.amount));
    
    let highestCat = { name: "", amount: 0 };
    categoryTotals.forEach((v, k) => { if(v > highestCat.amount) highestCat = { name: k, amount: v } });

    if (highestCat.amount > totalExpenses * 0.4 && totalExpenses > 100) {
        results.push({
            icon: Target,
            title: `High ${highestCat.name} Spend`,
            message: `Spending ${(highestCat.amount / totalExpenses * 100).toFixed(0)}% on ${highestCat.name}. Can you cut back?`,
            color: "text-warning",
        });
    }

    // 3. New Rule: Subscription Detector
    const subKeywords = ["subscription", "monthly", "netflix", "spotify", "prime", "youtube", "cloud", "gym", "membership"];
    const potentialSubs = transactions.filter(t => 
        t.type === "expense" && 
        subKeywords.some(kw => t.notes.toLowerCase().includes(kw) || t.category.toLowerCase().includes(kw))
    );

    if (potentialSubs.length >= 5) {
        results.push({
            icon: AlertCircle,
            title: "Subscription Overload",
            message: `You have ${potentialSubs.length} detected subscriptions. Consider auditing them to save money.`,
            color: "text-destructive",
        });
    }

    // 4. Emergency Fund Rule
    const monthlyAvgExp = totalExpenses > 0 ? totalExpenses : 1500;
    results.push({
        icon: ShieldCheck,
        title: "Emergency Fund",
        message: `Plan for a safety net of $${(monthlyAvgExp * 3).toLocaleString()} (3 months).`,
        color: "text-info",
    });

    return results;
  }, [totalIncome, totalExpenses, transactions]);

  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <h2 className="text-2xl font-bold font-display text-foreground flex items-center gap-2">
        <Sparkles className="h-6 w-6 text-primary" /> Finance Insights
      </h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            {trends.expChange > 0 ? <TrendingUp className="h-4 w-4 text-destructive" /> : <TrendingDown className="h-4 w-4 text-primary" />}
            <span className="text-sm font-medium text-card-foreground">Expense Trend</span>
          </div>
          <p className={`text-2xl font-bold ${trends.expChange > 0 ? "text-destructive" : "text-primary"}`}>
            {trends.expChange > 0 ? "+" : ""}{trends.expChange.toFixed(1)}%
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">vs last month</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            {trends.incChange >= 0 ? <TrendingUp className="h-4 w-4 text-primary" /> : <TrendingDown className="h-4 w-4 text-destructive" />}
            <span className="text-sm font-medium text-card-foreground">Income Trend</span>
          </div>
          <p className={`text-2xl font-bold ${trends.incChange >= 0 ? "text-primary" : "text-destructive"}`}>
            {trends.incChange > 0 ? "+" : ""}{trends.incChange.toFixed(1)}%
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">vs last month</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <PiggyBank className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-card-foreground">Savings Rate</span>
          </div>
          <p className="text-2xl font-bold text-primary">{savingsRate}%</p>
          <p className="text-[10px] text-muted-foreground mt-1">of income saved</p>
        </div>
      </div>

      {/* AI Powered Section */}
      <div className="gradient-primary rounded-2xl p-6 text-primary-foreground shadow-elevated relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Sparkles className="h-20 w-20" />
        </div>
        <div className="relative z-10 flex flex-col items-center text-center max-w-lg mx-auto">
          <h3 className="text-xl font-bold mb-2">Gemini AI Analysis</h3>
          <p className="text-sm opacity-90 mb-4 italic">Tailored financial advice based on your spending patterns</p>
          
          {isLoadingAI ? (
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full animate-pulse">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm font-medium">Analyzing your finances...</span>
            </div>
          ) : aiInsights.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 w-full text-left">
              {aiInsights.map((insight, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
                  <h4 className="text-sm font-bold">{insight.title}</h4>
                  <p className="text-xs opacity-90">{insight.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm">Add more transactions to unlock Gemini-powered AI analysis.</p>
          )}
        </div>
      </div>

      {/* Smart Internal Rules */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-warning" /> Smart Rules & Alerts
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dynamicTips.map((tip, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <tip.icon className={`h-4 w-4 ${tip.color}`} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-card-foreground">{tip.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{tip.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InsightsPage;


