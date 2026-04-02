import { useState, useMemo } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import { Download, FileText, Filter } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const ReportsPage = () => {
  const { transactions, categories } = useFinance();
  const [dateFrom, setDateFrom] = useState("2026-01-01");
  const [dateTo, setDateTo] = useState("2026-03-31");
  const [filterCategory, setFilterCategory] = useState("");

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      const inRange = t.date >= dateFrom && t.date <= dateTo;
      const inCat = !filterCategory || t.category === filterCategory;
      return inRange && inCat;
    });
  }, [transactions, dateFrom, dateTo, filterCategory]);

  const chartData = useMemo(() => {
    const map = new Map<string, { income: number; expense: number }>();
    filtered.forEach(t => {
      const m = t.date.slice(0, 7);
      const e = map.get(m) || { income: 0, expense: 0 };
      if (t.type === "income") e.income += t.amount; else e.expense += t.amount;
      map.set(m, e);
    });
    return Array.from(map, ([month, data]) => ({
      month: new Date(month + "-01").toLocaleDateString("en", { month: "short" }),
      ...data,
    }));
  }, [filtered]);

  const totalInc = filtered.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExp = filtered.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  const exportCSV = () => {
    const header = "Date,Type,Category,Amount,Notes\n";
    const rows = filtered.map(t => `${t.date},${t.type},${t.category},${t.amount},"${t.notes}"`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "financebuddy-report.csv";
    a.click();
  };

  const exportPDF = () => {
    const content = filtered.map(t => `${t.date} | ${t.type} | ${t.category} | $${t.amount} | ${t.notes}`).join("\n");
    const blob = new Blob([`FinanceBuddy Report\n${"=".repeat(50)}\nTotal Income: $${totalInc}\nTotal Expenses: $${totalExp}\nNet: $${totalInc - totalExp}\n${"=".repeat(50)}\n\n${content}`], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "financebuddy-report.txt";
    a.click();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold font-display text-foreground">Reports</h2>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="h-9 px-4 rounded-lg border border-border bg-card text-card-foreground text-sm font-medium flex items-center gap-1.5 hover:bg-muted transition-colors">
            <Download className="h-3.5 w-3.5" /> CSV
          </button>
          <button onClick={exportPDF} className="h-9 px-4 rounded-lg gradient-primary text-primary-foreground text-sm font-medium flex items-center gap-1.5 hover:opacity-90 transition-opacity">
            <FileText className="h-3.5 w-3.5" /> PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-card">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-card-foreground">Filters</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">From</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">To</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Category</label>
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 shadow-card">
          <p className="text-xs text-muted-foreground">Income</p>
          <p className="text-xl font-bold text-primary">${totalInc.toLocaleString()}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 shadow-card">
          <p className="text-xs text-muted-foreground">Expenses</p>
          <p className="text-xl font-bold text-destructive">${totalExp.toLocaleString()}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 shadow-card">
          <p className="text-xs text-muted-foreground">Net</p>
          <p className={`text-xl font-bold ${totalInc - totalExp >= 0 ? "text-primary" : "text-destructive"}`}>${(totalInc - totalExp).toLocaleString()}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
        <h3 className="text-sm font-semibold text-card-foreground mb-4">Income vs Expenses</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.5rem", fontSize: "0.75rem" }} />
              <Bar dataKey="income" fill="hsl(152, 56%, 42%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="hsl(0, 72%, 56%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <span className="text-sm font-semibold text-card-foreground">{filtered.length} transactions</span>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {filtered.map(t => (
            <div key={t.id} className="flex items-center justify-between p-3 border-b border-border last:border-0 text-sm">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs text-muted-foreground w-20 shrink-0">{t.date}</span>
                <span className="text-card-foreground font-medium truncate">{t.category}</span>
              </div>
              <span className={`font-semibold shrink-0 ${t.type === "income" ? "text-primary" : "text-destructive"}`}>
                {t.type === "income" ? "+" : "-"}${t.amount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
