import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ShieldCheck, Bell, CreditCard, HelpCircle, LogOut, ChevronRight, Smartphone, Lock } from "lucide-react";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — FinFlow" }] }),
  component: SettingsPage,
});

const groups = [
  {
    title: "Account",
    items: [
      { icon: CreditCard, label: "Subscription", value: "Trial · 47h left" },
      { icon: Bell, label: "Notifications", value: "On" },
      { icon: Smartphone, label: "Connected Device", value: "This phone" },
    ],
  },
  {
    title: "Privacy",
    items: [
      { icon: Lock, label: "SMS Processing", value: "On-device only" },
      { icon: ShieldCheck, label: "Data Sharing", value: "Never" },
    ],
  },
  {
    title: "Support",
    items: [
      { icon: HelpCircle, label: "Help & FAQs", value: "" },
      { icon: LogOut, label: "Sign out", value: "" },
    ],
  },
];

function SettingsPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-2xl px-5 py-8">
        <h1 className="text-3xl font-black tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your FinFlow account and privacy.</p>

        <div className="mt-6 rounded-2xl border border-primary/30 bg-surface-elevated p-5 flex items-center gap-4">
          <div className="size-12 rounded-full bg-[var(--gradient-emerald)] grid place-items-center font-black text-primary-foreground">U</div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">FinFlow User</p>
            <p className="text-xs text-muted-foreground">Premium Trial · 48h</p>
          </div>
          <Link to="/" className="text-xs font-semibold px-3 py-1.5 rounded-full bg-primary/15 text-primary active:scale-95 transition">Upgrade</Link>
        </div>

        {groups.map((g, gi) => (
          <motion.div
            key={g.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: gi * 0.06 }}
            className="mt-6"
          >
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2 px-2">{g.title}</p>
            <ul className="rounded-2xl border border-border bg-surface/60 overflow-hidden divide-y divide-border">
              {g.items.map((it) => (
                <li key={it.label}>
                  <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition active:bg-secondary/60">
                    <it.icon className="size-4 text-primary shrink-0" />
                    <span className="flex-1 text-sm font-medium">{it.label}</span>
                    {it.value && <span className="text-xs text-muted-foreground">{it.value}</span>}
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}

        <p className="mt-8 text-center text-[11px] text-muted-foreground">FinFlow v1.0 · Built for India</p>
      </section>
    </PageShell>
  );
}
