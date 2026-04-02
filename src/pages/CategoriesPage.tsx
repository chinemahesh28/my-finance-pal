import { useState } from "react";
import { useFinance, Category } from "@/contexts/FinanceContext";
import { Plus, Pencil, Trash2, X, Check, Smile } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const COMMON_ICONS = [
  "💰", "🍔", "🛒", "🚗", "🏠", "✈️", "🎮", "📱", "🎓", "💊", 
  "🛍️", "💡", "🎬", "🐾", "👔", "🍕", "☕", "⚽", "🏥", "🎁"
];

const CategoriesPage = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useFinance();
  const [editId, setEditId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("📁");
  const [color, setColor] = useState("hsl(210, 60%, 52%)");

  const handleAdd = () => {
    if (!name.trim()) return;
    addCategory({ name, icon, color });
    setName(""); setIcon("📁"); setShowAdd(false);
  };

  const handleUpdate = (cat: Category) => {
    updateCategory({ ...cat, name, icon, color });
    setEditId(null);
  };

  const startEdit = (cat: Category) => {
    setEditId(cat.id);
    setName(cat.name);
    setIcon(cat.icon);
    setColor(cat.color);
  };

  const EmojiPicker = ({ currentIcon, onSelect }: { currentIcon: string, onSelect: (i: string) => void }) => (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex h-10 w-12 items-center justify-center rounded-lg border border-input bg-background hover:bg-muted transition-colors focus:ring-2 focus:ring-ring focus:outline-none">
          <span className="text-lg">{currentIcon}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pick an icon</div>
        <div className="grid grid-cols-5 gap-2">
          {COMMON_ICONS.map(emoji => (
            <button
              key={emoji}
              onClick={() => onSelect(emoji)}
              className="flex h-10 w-10 items-center justify-center rounded-md text-xl hover:bg-muted transition-colors focus:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {emoji}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-display text-foreground">Categories</h2>
        <button onClick={() => { setShowAdd(!showAdd); setEditId(null); }}
          className="h-9 px-4 rounded-lg gradient-primary text-primary-foreground text-sm font-medium flex items-center gap-1.5 hover:opacity-90 transition-opacity">
          {showAdd ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showAdd ? "Cancel" : "Add"}
        </button>
      </div>

      {showAdd && (
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm animate-slide-up">
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 w-full">
              <label className="text-sm font-medium text-foreground mb-1.5 block">Category Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Groceries"
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Icon</label>
              <EmojiPicker currentIcon={icon} onSelect={setIcon} />
            </div>
            <button onClick={handleAdd} className="h-10 px-6 rounded-lg gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 w-full sm:w-auto">
              Save Category
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map(cat => (
          <div key={cat.id} className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center justify-between group hover:shadow-md transition-shadow">
            {editId === cat.id ? (
              <div className="flex items-center gap-2 flex-1">
                <EmojiPicker currentIcon={icon} onSelect={setIcon} />
                <input value={name} onChange={e => setName(e.target.value)} autoFocus
                  className="flex-1 h-10 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                <button onClick={() => handleUpdate(cat)} className="h-10 w-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                  <Check className="h-4 w-4" />
                </button>
                <button onClick={() => setEditId(null)} className="h-10 w-10 rounded-lg bg-muted text-muted-foreground flex items-center justify-center flex-shrink-0">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center text-lg" style={{ background: cat.color + "20" }}>
                    {cat.icon}
                  </div>
                  <span className="text-sm font-medium text-card-foreground">{cat.name}</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(cat)} className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => deleteCategory(cat.id)} className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesPage;
