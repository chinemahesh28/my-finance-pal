import { useState } from "react";
import { useFinance, TransactionType } from "@/contexts/FinanceContext";
import { Plus, Trash2, ArrowUpRight, ArrowDownRight, X } from "lucide-react";

const TransactionsPage = () => {
  const { transactions, categories, addTransaction, deleteTransaction } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category) return;
    addTransaction({ type, amount: parseFloat(amount), category, date, notes });
    setAmount(""); setCategory(""); setNotes(""); setShowForm(false);
  };

  const filteredCategories = categories.filter(c =>
    type === "income" ? ["Salary", "Freelance", "Investments"].includes(c.name) : !["Salary", "Freelance", "Investments"].includes(c.name)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-display text-foreground">Transactions</h2>
        <button onClick={() => setShowForm(!showForm)}
          className="h-9 px-4 rounded-lg gradient-primary text-primary-foreground text-sm font-medium flex items-center gap-1.5 hover:opacity-90 transition-opacity">
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancel" : "Add"}
        </button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-2xl p-5 shadow-card animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              {(["expense", "income"] as const).map(t => (
                <button key={t} type="button" onClick={() => setType(t)}
                  className={`flex-1 h-10 rounded-lg text-sm font-medium transition-all ${type === t
                    ? t === "income" ? "bg-primary text-primary-foreground" : "bg-destructive text-destructive-foreground"
                    : "bg-muted text-muted-foreground"}`}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Amount</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" min="0" step="0.01"
                  className="w-full h-11 px-4 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)}
                  className="w-full h-11 px-4 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Select category</option>
                  {filteredCategories.map(c => <option key={c.id} value={c.name}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="w-full h-11 px-4 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Notes</label>
                <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional note"
                  className="w-full h-11 px-4 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>

            <button type="submit" className="w-full h-11 rounded-lg gradient-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity">
              Add Transaction
            </button>
          </form>
        </div>
      )}

      <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
        {transactions.map(t => (
          <div key={t.id} className="flex items-center justify-between p-4 border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${t.type === "income" ? "bg-accent" : "bg-destructive/10"}`}>
                {t.type === "income" ? <ArrowUpRight className="h-4 w-4 text-primary" /> : <ArrowDownRight className="h-4 w-4 text-destructive" />}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-card-foreground">{t.category}</p>
                <p className="text-xs text-muted-foreground truncate">{t.notes} · {t.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <p className={`text-sm font-semibold ${t.type === "income" ? "text-primary" : "text-destructive"}`}>
                {t.type === "income" ? "+" : "-"}${t.amount}
              </p>
              <button onClick={() => deleteTransaction(t.id)} className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionsPage;
