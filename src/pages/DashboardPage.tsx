import { useMemo } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CHART_COLORS = [
  "hsl(152, 56%, 42%)", "hsl(210, 60%, 52%)", "hsl(38, 92%, 50%)",
  "hsl(0, 72%, 56%)", "hsl(280, 60%, 55%)", "hsl(330, 60%, 55%)",
  "hsl(190, 60%, 45%)", "hsl(120, 45%, 45%)",
];

const DashboardPage = () => {
  const { transactions, totalBalance, totalIncome, totalExpenses } = useFinance();

  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    transactions.filter(t => t.type === "expense").forEach(t => map.set(t.category, (map.get(t.category) || 0) + t.amount));
    return Array.from(map, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [transactions]);

  const monthlyData = useMemo(() => {
    const map = new Map<string, { income: number; expense: number }>();
    transactions.forEach(t => {
      const m = t.date.slice(0, 7);
      const entry = map.get(m) || { income: 0, expense: 0 };
      if (t.type === "income") entry.income += t.amount;
      else entry.expense += t.amount;
      map.set(m, entry);
    });
    return Array.from(map, ([month, data]) => ({
      month: new Date(month + "-01").toLocaleDateString("en", { month: "short", year: "2-digit" }),
      ...data,
    })).sort((a, b) => a.month.localeCompare(b.month));
  }, [transactions]);

  const recentTransactions = transactions.slice(0, 6);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-display text-foreground">Dashboard</h2>
        <Link to="/account">
          <Button className="gap-2">
            <Wallet className="w-4 h-4" />
            Access Accounts
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Balance", value: totalBalance, icon: Wallet, gradient: "gradient-hero" },
          { label: "Total Income", value: totalIncome, icon: TrendingUp, gradient: "gradient-primary" },
          { label: "Total Expenses", value: totalExpenses, icon: TrendingDown, gradient: "gradient-secondary" },
        ].map(card => (
          <div key={card.label} className={`${card.gradient} rounded-2xl p-5 text-primary-foreground shadow-elevated`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium opacity-90">{card.label}</span>
              <card.icon className="h-5 w-5 opacity-80" />
            </div>
            <p className="text-2xl font-bold">${card.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
          <h3 className="text-sm font-semibold text-card-foreground mb-4">Expenses by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={3} stroke="none">
                  {categoryData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => `$${v}`} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.5rem", fontSize: "0.75rem" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {categoryData.map((d, i) => (
              <span key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                {d.name}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
          <h3 className="text-sm font-semibold text-card-foreground mb-4">Monthly Trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.5rem", fontSize: "0.75rem" }} />
                <Line type="monotone" dataKey="income" stroke="hsl(152, 56%, 42%)" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="expense" stroke="hsl(0, 72%, 56%)" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
        <h3 className="text-sm font-semibold text-card-foreground mb-4">Recent Transactions</h3>
        <div className="space-y-3">
          {recentTransactions.map(t => (
            <div key={t.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${t.type === "income" ? "bg-accent" : "bg-destructive/10"}`}>
                  {t.type === "income" ? <ArrowUpRight className="h-4 w-4 text-primary" /> : <ArrowDownRight className="h-4 w-4 text-destructive" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-card-foreground">{t.category}</p>
                  <p className="text-xs text-muted-foreground">{t.notes}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${t.type === "income" ? "text-primary" : "text-destructive"}`}>
                  {t.type === "income" ? "+" : "-"}${t.amount}
                </p>
                <p className="text-xs text-muted-foreground">{t.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
