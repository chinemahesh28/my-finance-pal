import { useState } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import { Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Plus } from "lucide-react";

const AccountsPage = () => {
  const { account, accounts, switchAccount, addAccount, transactions, totalIncome, totalExpenses } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [newAccName, setNewAccName] = useState("");
  const [newAccType, setNewAccType] = useState("SAVINGS");
  const [newAccBalance, setNewAccBalance] = useState("");

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName || !newAccBalance) return;
    await addAccount(newAccName, newAccType, Number(newAccBalance));
    setShowForm(false);
    setNewAccName("");
    setNewAccBalance("");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
         <h2 className="text-xl font-bold font-display text-foreground">Account Overview</h2>
         <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus className="h-4 w-4" /> Add Account
         </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddAccount} className="bg-card border border-border p-5 rounded-2xl shadow-sm mb-6 space-y-4">
           <h3 className="font-semibold">Create New Account</h3>
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                 <label className="block text-xs font-medium text-muted-foreground mb-1">Account Name</label>
                 <input autoFocus required type="text" value={newAccName} onChange={e => setNewAccName(e.target.value)} placeholder="e.g. Chase Checking" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                 <label className="block text-xs font-medium text-muted-foreground mb-1">Type</label>
                 <select value={newAccType} onChange={e => setNewAccType(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <option value="SAVINGS">Savings</option>
                    <option value="CHECKING">Checking</option>
                    <option value="CREDIT_CARD">Credit Card</option>
                    <option value="CASH">Cash File</option>
                 </select>
              </div>
              <div>
                 <label className="block text-xs font-medium text-muted-foreground mb-1">Starting Balance</label>
                 <input required type="number" step="0.01" value={newAccBalance} onChange={e => setNewAccBalance(e.target.value)} placeholder="0.00" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
           </div>
           <div className="flex justify-end gap-2 mt-4">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg transition-colors">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">Create Account</button>
           </div>
        </form>
      )}

      {accounts.length > 0 && (
         <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {accounts.map(acc => (
               <button key={acc.id} onClick={() => switchAccount(acc.id)} className={`flex-shrink-0 px-4 py-3 rounded-xl border text-left min-w-[140px] transition-all ${account?.id === acc.id ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-card hover:bg-muted"}`}>
                  <p className={`text-sm font-semibold truncate ${account?.id === acc.id ? "text-primary" : "text-foreground"}`}>{acc.name}</p>
                  <p className="text-xs text-muted-foreground">${acc.balance.toLocaleString()}</p>
               </button>
            ))}
         </div>
      )}

      {account ? (
        <>
          <div className="gradient-hero rounded-2xl p-6 text-primary-foreground shadow-elevated">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-medium opacity-90">{account.name}</span>
              <Wallet className="h-6 w-6 opacity-80" />
            </div>
            <p className="text-sm opacity-80 mb-4">{account.type}</p>
            <p className="text-4xl font-bold">${account.balance.toLocaleString()}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-border rounded-xl p-5 shadow-card bg-card flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Income Tracked</p>
                <p className="text-xl font-bold text-primary">${totalIncome.toLocaleString()}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="border border-border rounded-xl p-5 shadow-card bg-card flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Expenses Tracked</p>
                <p className="text-xl font-bold text-destructive">${totalExpenses.toLocaleString()}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 shadow-card mt-6">
            <h3 className="text-sm font-semibold text-card-foreground mb-4">Account Transactions</h3>
            {transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.map(t => (
                  <div key={t.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${t.type === "income" ? "bg-accent" : "bg-destructive/10"}`}>
                        {t.type === "income" ? <ArrowUpRight className="h-4 w-4 text-primary" /> : <ArrowDownRight className="h-4 w-4 text-destructive" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-card-foreground">{t.category}</p>
                        <p className="text-xs text-muted-foreground">{t.notes || "No notes"}</p>
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
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No transactions recorded under this account yet.
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="p-8 text-center bg-card border border-border rounded-2xl shadow-sm text-muted-foreground mt-6">
          <p className="mb-2">No active account found.</p>
        </div>
      )}
    </div>
  );
};

export default AccountsPage;
