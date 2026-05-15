import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Plus, X, Trash2, TrendingUp, Wallet,
  Utensils, ShoppingBag, Receipt as ReceiptIcon, Fuel, Zap, MoreHorizontal, AlertTriangle,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { PageShell } from "@/components/PageShell";
import { useAuth } from "@/hooks/use-auth";
import { useSMSTracker } from "@/hooks/use-sms-tracker";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Capacitor } from "@capacitor/core";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Tracker — FinFlow" }] }),
  component: Dashboard,
});

type Expense = {
  id: string;
  amount: number;
  category: string;
  merchant: string | null;
  note: string | null;
  spent_at: string;
};

type Sub = {
  id: string;
  name: string;
  amount: number;
  billing_cycle: string;
  is_active: boolean;
};

const CATS = ["Food", "Shopping", "Bills", "Travel", "Other"] as const;
const CAT_COLORS: Record<string, string> = {
  Food: "#10b981", Shopping: "#3b82f6", Bills: "#f59e0b", Travel: "#a855f7", Other: "#64748b",
};
const CAT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Food: Utensils, Shopping: ShoppingBag, Bills: ReceiptIcon, Travel: Fuel, Other: MoreHorizontal,
};

function Dashboard() {
  const nav = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<"expenses" | "subs">("expenses");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [subs, setSubs] = useState<Sub[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showAddSub, setShowAddSub] = useState(false);
  const { fetchSMS, loading: smsLoading } = useSMSTracker();
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) nav({ to: "/auth" });
  }, [user, authLoading, nav]);

  useEffect(() => {
    if (!user) return;
    void load();
  }, [user]);

  async function load() {
    setLoading(true);
    const [{ data: exp }, { data: sb }] = await Promise.all([
      supabase.from("expenses").select("*").order("spent_at", { ascending: false }),
      supabase.from("subscriptions").select("*").order("created_at", { ascending: false }),
    ]);
    setExpenses((exp ?? []) as Expense[]);
    setSubs((sb ?? []) as Sub[]);
    setLoading(false);
  }

  const totals = useMemo(() => {
    const now = new Date();
    const m = expenses.filter((e) => {
      const d = new Date(e.spent_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const monthSum = m.reduce((a, b) => a + Number(b.amount), 0);
    const byCat = CATS.map((c) => ({
      name: c,
      value: m.filter((e) => e.category === c).reduce((a, b) => a + Number(b.amount), 0),
    })).filter((x) => x.value > 0);
    const wasted = subs.filter((s) => s.is_active).reduce((a, b) => a + Number(b.amount), 0);
    return { monthSum, byCat, wasted, count: m.length };
  }, [expenses, subs]);

  async function delExpense(id: string) {
    const prev = expenses;
    setExpenses(expenses.filter((e) => e.id !== id));
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (error) {
      setExpenses(prev);
      toast.error("Could not delete");
    }
  }

  async function delSub(id: string) {
    const prev = subs;
    setSubs(subs.filter((s) => s.id !== id));
    const { error } = await supabase.from("subscriptions").delete().eq("id", id);
    if (error) {
      setSubs(prev);
      toast.error("Could not delete");
    } else toast.success("Cancelled");
  }

  async function syncSMS() {
    if (!Capacitor.isNativePlatform()) {
      toast.error("SMS sync works only in the Android App");
      return;
    }
    setSyncing(true);
    try {
      const msgs = await fetchSMS();
      if (msgs.length === 0) {
        toast.info("No banking SMS found recently");
        return;
      }
      
      // Simple logic to find amounts in SMS
      // In a real app, this would be much more complex regex
      const newExpenses = msgs.map(m => {
        const amtMatch = m.body.match(/(?:Rs\.?|INR|debited)\s?([\d,.]+)/i);
        const amount = amtMatch ? parseFloat(amtMatch[1].replace(/,/g, '')) : 0;
        if (amount > 0) {
          return {
            user_id: user?.id,
            amount,
            category: "Other",
            merchant: m.address,
            note: m.body.substring(0, 50) + "...",
            spent_at: new Date(m.date).toISOString()
          };
        }
        return null;
      }).filter(Boolean);

      if (newExpenses.length > 0) {
        const { error } = await supabase.from("expenses").insert(newExpenses);
        if (error) throw error;
        toast.success(`Synced ${newExpenses.length} transactions!`);
        void load();
      } else {
        toast.info("No new transactions found in SMS");
      }
    } catch (err: any) {
      toast.error(err.message || "Sync failed");
    } finally {
      setSyncing(false);
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-5 pt-6 pb-10">
        {/* Header summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-gradient-to-br from-secondary/50 to-secondary/10 p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">This Month</p>
              <p className="font-display text-3xl font-bold mt-1">₹{totals.monthSum.toLocaleString("en-IN")}</p>
              <p className="text-xs text-muted-foreground mt-1">{totals.count} transactions</p>
            </div>
            <div className="size-12 rounded-xl bg-primary/10 grid place-items-center">
              <Wallet className="size-6 text-primary" />
            </div>
          </div>
          {totals.byCat.length > 0 && (
            <div className="mt-4 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={totals.byCat} dataKey="value" innerRadius={32} outerRadius={56} paddingAngle={2}>
                    {totals.byCat.map((c) => <Cell key={c.name} fill={CAT_COLORS[c.name]} />)}
                  </Pie>
                  <Tooltip
                    formatter={(v) => `₹${Number(v).toLocaleString("en-IN")}`}
                    contentStyle={{ background: "#0a0a0a", border: "1px solid #222", borderRadius: 8, fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mt-5 mb-3">
          <button
            onClick={() => setTab("expenses")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition active:scale-95 ${
              tab === "expenses" ? "bg-primary text-primary-foreground" : "bg-secondary/40 text-muted-foreground"
            }`}
          >
            Expenses
          </button>
          <button
            onClick={() => setTab("subs")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition active:scale-95 relative ${
              tab === "subs" ? "bg-primary text-primary-foreground" : "bg-secondary/40 text-muted-foreground"
            }`}
          >
            Subscriptions
            {subs.filter((s) => s.is_active).length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center size-4 text-[9px] rounded-full bg-destructive text-destructive-foreground">
                {subs.filter((s) => s.is_active).length}
              </span>
            )}
          </button>
        </div>

        {tab === "expenses" ? (
          <>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider">Recent</h2>
              <div className="flex gap-3">
                {Capacitor.isNativePlatform() && (
                  <button
                    onClick={syncSMS}
                    disabled={syncing}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-500 hover:underline disabled:opacity-50"
                  >
                    {syncing ? <Loader2 className="size-3 animate-spin" /> : <Zap className="size-3" />}
                    Sync SMS
                  </button>
                )}
                <button
                  onClick={() => setShowAdd(true)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  <Plus className="size-3.5" /> Add
                </button>
              </div>
            </div>
            {loading ? (
              <div className="py-12 grid place-items-center"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>
            ) : expenses.length === 0 ? (
              <EmptyState onAdd={() => setShowAdd(true)} />
            ) : (
              <ul className="space-y-2">
                {expenses.map((e) => {
                  const Icon = CAT_ICONS[e.category] ?? MoreHorizontal;
                  return (
                    <li key={e.id} className="group flex items-center gap-3 rounded-xl border border-border bg-secondary/20 p-3">
                      <div className="size-10 rounded-lg grid place-items-center" style={{ background: `${CAT_COLORS[e.category]}20` }}>
                        <Icon className="size-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{e.merchant || e.category}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {e.category} · {new Date(e.spent_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </p>
                      </div>
                      <p className="font-display font-bold">₹{Number(e.amount).toLocaleString("en-IN")}</p>
                      <button
                        onClick={() => delExpense(e.id)}
                        className="opacity-0 group-hover:opacity-100 md:opacity-0 active:opacity-100 transition p-1 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                Recurring
              </h2>
              <button onClick={() => setShowAddSub(true)} className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                <Plus className="size-3.5" /> Add
              </button>
            </div>
            {totals.wasted > 0 && (
              <div className="mb-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3 flex items-center gap-3">
                <AlertTriangle className="size-5 text-destructive" />
                <div className="flex-1">
                  <p className="text-xs font-semibold">Recurring drain</p>
                  <p className="text-[11px] text-muted-foreground">₹{totals.wasted.toLocaleString("en-IN")}/mo across {subs.filter(s=>s.is_active).length} subs</p>
                </div>
              </div>
            )}
            {loading ? (
              <div className="py-12 grid place-items-center"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>
            ) : subs.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                No subscriptions yet. <button onClick={() => setShowAddSub(true)} className="text-primary font-semibold">Add one</button>
              </div>
            ) : (
              <ul className="space-y-2">
                {subs.map((s) => (
                  <li key={s.id} className="flex items-center gap-3 rounded-xl border border-border bg-secondary/20 p-3">
                    <div className="size-10 rounded-lg bg-primary/10 grid place-items-center font-bold text-primary">
                      {s.name[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{s.name}</p>
                      <p className="text-[11px] text-muted-foreground capitalize">{s.billing_cycle}</p>
                    </div>
                    <p className="font-display font-bold">₹{Number(s.amount).toLocaleString("en-IN")}</p>
                    <button onClick={() => delSub(s.id)} className="p-1.5 rounded-md text-destructive hover:bg-destructive/10">
                      <Trash2 className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      {/* Floating add button */}
      <button
        onClick={() => (tab === "expenses" ? setShowAdd(true) : setShowAddSub(true))}
        className="fixed right-5 bottom-24 md:bottom-8 z-30 size-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 grid place-items-center active:scale-90 transition"
      >
        <Plus className="size-6" />
      </button>

      <AnimatePresence>
        {showAdd && <AddExpenseModal onClose={() => setShowAdd(false)} onAdded={(e) => { setExpenses([e, ...expenses]); setShowAdd(false); }} userId={user.id} />}
        {showAddSub && <AddSubModal onClose={() => setShowAddSub(false)} onAdded={(s) => { setSubs([s, ...subs]); setShowAddSub(false); }} userId={user.id} />}
      </AnimatePresence>
    </PageShell>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="py-12 text-center">
      <div className="inline-flex size-14 rounded-2xl bg-primary/10 items-center justify-center mb-3">
        <TrendingUp className="size-7 text-primary" />
      </div>
      <p className="font-semibold">Start tracking</p>
      <p className="text-xs text-muted-foreground mt-1 mb-4">Add your first expense to see insights</p>
      <button onClick={onAdd} className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold active:scale-95 transition">
        <Plus className="size-4" /> Add expense
      </button>
    </div>
  );
}

function AddExpenseModal({ onClose, onAdded, userId }: { onClose: () => void; onAdded: (e: Expense) => void; userId: string }) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>("Food");
  const [merchant, setMerchant] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return toast.error("Enter a valid amount");
    setBusy(true);
    const { data, error } = await supabase
      .from("expenses")
      .insert({ user_id: userId, amount: amt, category, merchant: merchant || null, note: note || null })
      .select()
      .single();
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Expense added");
    onAdded(data as Expense);
  }

  return (
    <Modal onClose={onClose} title="Add expense">
      <form onSubmit={save} className="space-y-3">
        <div>
          <label className="text-xs text-muted-foreground">Amount (₹)</label>
          <input
            autoFocus type="number" inputMode="decimal" step="0.01" required
            value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0"
            className="mt-1 w-full px-3 py-3 rounded-lg bg-secondary/40 border border-border text-2xl font-bold focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Category</label>
          <div className="mt-1 grid grid-cols-5 gap-1.5">
            {CATS.map((c) => (
              <button type="button" key={c} onClick={() => setCategory(c)}
                className={`py-2 rounded-md text-[11px] font-semibold border transition ${
                  category === c ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                }`}>{c}</button>
            ))}
          </div>
        </div>
        <input value={merchant} onChange={(e) => setMerchant(e.target.value)} placeholder="Merchant (optional)"
          className="w-full px-3 py-2.5 rounded-lg bg-secondary/40 border border-border text-sm focus:outline-none focus:border-primary" />
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)"
          className="w-full px-3 py-2.5 rounded-lg bg-secondary/40 border border-border text-sm focus:outline-none focus:border-primary" />
        <button disabled={busy} className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg active:scale-95 transition flex items-center justify-center gap-2 disabled:opacity-50">
          {busy && <Loader2 className="size-4 animate-spin" />} Save
        </button>
      </form>
    </Modal>
  );
}

function AddSubModal({ onClose, onAdded, userId }: { onClose: () => void; onAdded: (s: Sub) => void; userId: string }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [cycle, setCycle] = useState<"monthly" | "yearly" | "weekly">("monthly");
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!name.trim() || !amt) return toast.error("Fill name + amount");
    setBusy(true);
    const { data, error } = await supabase
      .from("subscriptions")
      .insert({ user_id: userId, name: name.trim(), amount: amt, billing_cycle: cycle })
      .select().single();
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Added");
    onAdded(data as Sub);
  }

  return (
    <Modal onClose={onClose} title="Add subscription">
      <form onSubmit={save} className="space-y-3">
        <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Netflix"
          className="w-full px-3 py-3 rounded-lg bg-secondary/40 border border-border text-sm focus:outline-none focus:border-primary" />
        <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount ₹"
          className="w-full px-3 py-3 rounded-lg bg-secondary/40 border border-border text-sm focus:outline-none focus:border-primary" />
        <div className="grid grid-cols-3 gap-1.5">
          {(["weekly", "monthly", "yearly"] as const).map((c) => (
            <button type="button" key={c} onClick={() => setCycle(c)}
              className={`py-2 rounded-md text-xs font-semibold border capitalize ${
                cycle === c ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
              }`}>{c}</button>
          ))}
        </div>
        <button disabled={busy} className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg active:scale-95 transition flex items-center justify-center gap-2 disabled:opacity-50">
          {busy && <Loader2 className="size-4 animate-spin" />} Save
        </button>
      </form>
    </Modal>
  );
}

function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md bg-background border border-border rounded-t-2xl sm:rounded-2xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-lg">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-secondary"><X className="size-4" /></button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}
