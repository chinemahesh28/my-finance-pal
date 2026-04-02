import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

const API_BASE_URL = "http://localhost:9090/api";

export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  notes: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  type?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "warning" | "info" | "alert";
  read: boolean;
  date: string;
}

interface FinanceContextType {
  user: { id: number; name: string; email: string; avatar: string } | null;
  account: { id: number; name: string; type: string; balance: number } | null;
  accounts: { id: number; name: string; type: string; balance: number }[];
  isAuthenticated: boolean;
  isDarkMode: boolean;
  transactions: Transaction[];
  categories: Category[];
  notifications: Notification[];
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  toggleDarkMode: () => void;
  addTransaction: (t: Omit<Transaction, "id">) => Promise<void>;
  deleteTransaction: (id: string) => void;
  addAccount: (name: string, type: string, balance: number) => Promise<void>;
  switchAccount: (id: number) => void;
  addCategory: (c: Omit<Category, "id">) => void;
  updateCategory: (c: Category) => void;
  deleteCategory: (id: string) => void;
  markNotificationRead: (id: string) => void;
  triggerNotification: (title: string, message: string, type: "warning" | "info" | "alert") => void;
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
}

const defaultCategories = [
    { name: "Food & Dining", icon: "🍔", type: "EXPENSE" },
    { name: "Transportation", icon: "🚗", type: "EXPENSE" },
    { name: "Bills & Utilities", icon: "💡", type: "EXPENSE" },
    { name: "Shopping", icon: "🛍️", type: "EXPENSE" },
    { name: "Salary", icon: "💰", type: "INCOME" },
    { name: "Freelance", icon: "💻", type: "INCOME" }
];

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ id: number; name: string; email: string; avatar: string } | null>(() => {
    const saved = localStorage.getItem("financeUser");
    return saved ? JSON.parse(saved) : null;
  });
  const [account, setAccount] = useState<{ id: number; name: string; type: string; balance: number } | null>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [accountId, setAccountId] = useState<number | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const triggerNotification = useCallback((title: string, message: string, type: "warning" | "info" | "alert") => {
    setNotifications(prev => [{
      id: Date.now().toString(),
      title,
      message,
      type,
      read: false,
      date: new Date().toISOString()
    }, ...prev]);

    // Show toast
    if (type === "alert") {
      toast.error(title, { description: message });
    } else if (type === "warning") {
      toast.warning(title, { description: message });
    } else {
      toast.success(title, { description: message });
    }
  }, []);

  const apiFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const authHeader = localStorage.getItem("authHeader");
    const headers = { ...options.headers };
    if (authHeader) {
      (headers as any)["Authorization"] = authHeader;
    }
    return fetch(`${API_BASE_URL}${url}`, { ...options, headers });
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await apiFetch(`/categories`);
      if (!response.ok) return;
      const data = await response.json();
      if (data.length === 0) {
          // Seed if empty
          for (const cat of defaultCategories) {
              await apiFetch(`/categories`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(cat)
              });
          }
          const retry = await apiFetch(`/categories`);
          setCategories(await retry.json());
      } else {
          setCategories(data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  }, [apiFetch]);

  const fetchTransactions = useCallback(async (id: number) => {
    try {
      const response = await apiFetch(`/transactions/account/${id}`);
      if (!response.ok) return;
      const data = await response.json();
      setTransactions(data.map((t: any) => ({
        id: t.id.toString(),
        type: t.type.toLowerCase() as TransactionType,
        amount: t.amount,
        category: t.category.name,
        date: t.transactionDate.split("T")[0],
        notes: t.description
      })));
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    }
  }, [apiFetch]);

  const fetchUserAccounts = useCallback(async (userId: number, currentAccountId?: number | null) => {
    try {
      const response = await apiFetch(`/accounts/user/${userId}`);
      if (!response.ok) return;
      const data = await response.json();
      setAccounts(data);
      if (data.length > 0) {
        let targetId = currentAccountId;
        setAccountId(prevId => {
           targetId = targetId || prevId;
           return targetId;
        });
        
        setAccountId(prevId => {
           const activeId = currentAccountId || prevId || data[0].id;
           const acc = data.find((a: any) => a.id === activeId) || data[0];
           setAccount(acc);
           fetchTransactions(acc.id);
           return acc.id;
        });
      }
    } catch (error) {
      console.error("Failed to fetch user accounts:", error);
    }
  }, [fetchTransactions, apiFetch]);

  // Initial Fetching
  useEffect(() => {
    if (user) {
      fetchCategories();
      fetchUserAccounts(user.id);
    }
  }, [user, fetchCategories, fetchUserAccounts]);

  const login = useCallback(async (username: string, password: string) => {
    try {
      const header = "Basic " + btoa(`${username}:${password}`);
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        headers: { "Authorization": header }
      });
      if (!response.ok) {
          toast.error("Login Failed", { description: "Invalid username or password" });
          return false;
      }
      const userData = await response.json();
      const userObj = { id: userData.id, name: userData.username, email: userData.email, avatar: userData.username[0].toUpperCase() };
      
      localStorage.setItem("authHeader", header);
      localStorage.setItem("financeUser", JSON.stringify(userObj));
      setUser(userObj);
      
      toast.success("Welcome back!", { description: `Signed in as ${userData.username}` });
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Login Failed", { description: "An error occurred during sign in" });
      return false;
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: name, email, password })
      });
      if (!response.ok) {
          toast.error("Registration Failed", { description: "Email might already be taken" });
          return false;
      }
      return await login(name, password); // Automatically login after registering
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error("Registration Error", { description: "Failed to create your account" });
      return false;
    }
  }, [login]);

  const logout = useCallback(() => {
      localStorage.removeItem("authHeader");
      localStorage.removeItem("financeUser");
      setUser(null);
      setAccount(null);
      setAccounts([]);
      setAccountId(null);
      setTransactions([]);
      toast.info("Signed Out", { description: "You have been logged out successfully" });
  }, []);


  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  }, []);

  const addTransaction = useCallback(async (t: Omit<Transaction, "id">) => {
    if (!accountId) return;
    try {
        const response = await apiFetch(`/transactions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                amount: t.amount,
                description: t.notes,
                transactionDate: new Date(t.date).toISOString(),
                type: t.type.toUpperCase(),
                account: { id: accountId },
                category: { id: categories.find(c => c.name === t.category)?.id || 1 }
            })
        });
        if (response.ok) {
            triggerNotification("Transaction Added", `Successfully added ${t.type} formatting to $${t.amount}.`, "info");
            fetchTransactions(accountId);
            if (user) fetchUserAccounts(user.id);
        } else {
            triggerNotification("Error", "Failed to add transaction.", "alert");
        }
    } catch (error) {
        console.error("Failed to add transaction:", error);
        triggerNotification("Error", "An error occurred while adding transaction.", "alert");
    }
  }, [accountId, categories, fetchTransactions, fetchUserAccounts, triggerNotification, user, apiFetch]);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    triggerNotification("Transaction Deleted", "A transaction has been successfully removed.", "warning");
    if (user) fetchUserAccounts(user.id);
  }, [triggerNotification, user, fetchUserAccounts]);

  const addAccount = useCallback(async (name: string, type: string, balance: number) => {
    if (!user) return;
    try {
      const response = await apiFetch(`/accounts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type, balance, user: { id: user.id } })
      });
      if (response.ok) {
        triggerNotification("Account Created", `Successfully created ${name} account.`, "info");
        const newAcc = await response.json();
        setAccounts(prev => [...prev, newAcc]);
        if (!accountId) {
           setAccountId(newAcc.id);
           setAccount(newAcc);
        }
      } else {
        triggerNotification("Error", "Failed to create account.", "alert");
      }
    } catch (error) {
       console.error("Failed to create account:", error);
       triggerNotification("Error", "An exception occurred.", "alert");
    }
  }, [user, triggerNotification, accountId, apiFetch]);

  const switchAccount = useCallback((id: number) => {
    const acc = accounts.find(a => a.id === id);
    if (acc) {
      setAccountId(acc.id);
      setAccount(acc);
      fetchTransactions(acc.id);
    }
  }, [accounts, fetchTransactions]);

  const addCategory = useCallback((c: Omit<Category, "id">) => {
    setCategories(prev => [...prev, { ...c, id: Date.now().toString() }]);
    triggerNotification("Category Added", `Created category: ${c.name}`, "info");
  }, [triggerNotification]);

  const updateCategory = useCallback((c: Category) => {
    setCategories(prev => prev.map(cat => cat.id === c.id ? c : cat));
    triggerNotification("Category Updated", `Updated category: ${c.name}`, "info");
  }, [triggerNotification]);

  const deleteCategory = useCallback((id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    triggerNotification("Category Deleted", "Category removed successfully.", "warning");
  }, [triggerNotification]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const totalIncome = transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const totalBalance = account ? account.balance : totalIncome - totalExpenses;

  return (
    <FinanceContext.Provider value={{
      user, account, accounts, isAuthenticated: !!user, isDarkMode, transactions, categories, notifications,
      login, register, logout, toggleDarkMode, addTransaction, deleteTransaction,
      addAccount, switchAccount, addCategory, updateCategory, deleteCategory, markNotificationRead, triggerNotification,
      totalBalance, totalIncome, totalExpenses,
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used within FinanceProvider");
  return ctx;
};
