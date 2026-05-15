import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Zap, Users, Sparkles, ArrowRight, TrendingUp, MessageSquare, BarChart3 } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { PaymentModal } from "@/components/PaymentModal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FinFlow AI — Stop Losing Money to Hidden Expenses" },
      { name: "description", content: "FinFlow auto-tracks your bank SMS, predicts your future wealth, and helps Indians save ₹5,000+ monthly. Start a 2-day trial for ₹1." },
      { property: "og:title", content: "FinFlow AI — Auto Finance Tracker" },
      { property: "og:description", content: "Track expenses automatically from SMS, predict wealth, optimize taxes." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const [pay, setPay] = useState(false);
  return (
    <PageShell>
      <Hero onCta={() => setPay(true)} />
      <TrustBar />
      <BeforeAfter />
      <Features />
      <FinalCta onCta={() => setPay(true)} />
      <PaymentModal open={pay} onClose={() => setPay(false)} />
    </PageShell>
  );
}

function Hero({ onCta }: { onCta: () => void }) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "var(--gradient-radial)" }}
      />
      <div className="relative mx-auto max-w-5xl px-5 sm:px-8 pt-20 pb-24 sm:pt-28 sm:pb-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface text-xs text-muted-foreground"
        >
          <Sparkles className="size-3 text-primary" />
          AI-powered • Built for India
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="mt-6 text-balance text-4xl sm:text-6xl md:text-7xl font-black leading-[1.02] tracking-tight"
        >
          Stop Losing Money to{" "}
          <span className="bg-clip-text text-transparent bg-[var(--gradient-emerald)]">
            Hidden Expenses.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-6 text-balance text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto"
        >
          FinFlow automatically tracks your bank SMS, predicts your future wealth,
          and saves you <span className="text-foreground font-semibold">₹5,000+ monthly</span> using smart logic.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-10 flex flex-col items-center gap-3"
        >
          <button
            onClick={onCta}
            className="group relative inline-flex items-center gap-2 h-14 px-7 sm:px-8 rounded-2xl bg-primary text-primary-foreground font-bold text-base sm:text-lg animate-pulse-glow active:scale-[0.98] transition"
          >
            Start 2-Day Trial at ₹1
            <ArrowRight className="size-5 group-hover:translate-x-0.5 transition" />
          </button>
          <p className="text-xs text-muted-foreground">No card details saved · Cancel anytime</p>
        </motion.div>
      </div>
    </section>
  );
}

function TrustBar() {
  const items = [
    { icon: ShieldCheck, label: "Safe & Encrypted" },
    { icon: Zap, label: "No Manual Entry" },
    { icon: Users, label: "Used by 10k+ Savers" },
  ];
  return (
    <section className="border-y border-border bg-surface/40">
      <div className="mx-auto max-w-5xl px-5 sm:px-8 py-6 grid grid-cols-3 gap-4">
        {items.map((it) => (
          <div key={it.label} className="flex items-center justify-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <it.icon className="size-4 text-primary shrink-0" />
            <span className="truncate">{it.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function BeforeAfter() {
  const before = [
    "₹450 — Starbucks (?)",
    "Debited 1,200",
    "UPI/PSP/45@ybl",
    "Recharge 299",
    "ATM WD 5000",
    "Amzn 2,899",
  ];
  const after = [
    { cat: "Food & Drinks", brand: "Starbucks", amt: 450 },
    { cat: "Shopping", brand: "Amazon", amt: 2899 },
    { cat: "Bills", brand: "Jio Recharge", amt: 299 },
    { cat: "Cash", brand: "ATM Withdrawal", amt: 5000 },
  ];
  return (
    <section className="mx-auto max-w-6xl px-5 sm:px-8 py-20 sm:py-28">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight">From chaos to clarity.</h2>
        <p className="mt-3 text-muted-foreground">See exactly what FinFlow does to your bank notifications.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        <Card label="Before FinFlow" tone="muted">
          <ul className="space-y-2 font-mono text-xs sm:text-sm">
            {before.map((b, i) => (
              <li key={i} className="px-3 py-2.5 rounded-lg bg-background/50 border border-border text-muted-foreground">
                {b}
              </li>
            ))}
          </ul>
        </Card>
        <Card label="After FinFlow" tone="primary">
          <ul className="space-y-2">
            {after.map((a, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="px-3 py-2.5 rounded-lg bg-background/60 border border-border flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-md bg-primary/10 grid place-items-center text-primary text-xs font-bold">
                    {a.brand[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{a.brand}</p>
                    <p className="text-[11px] text-muted-foreground">{a.cat}</p>
                  </div>
                </div>
                <span className="text-sm font-bold">₹{a.amt.toLocaleString("en-IN")}</span>
              </motion.li>
            ))}
          </ul>
        </Card>
      </div>
    </section>
  );
}

function Card({ label, tone, children }: { label: string; tone: "muted" | "primary"; children: React.ReactNode }) {
  return (
    <div className={`rounded-2xl border p-5 sm:p-6 ${tone === "primary" ? "border-primary/30 bg-surface-elevated" : "border-border bg-surface/40"}`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
        {tone === "primary" && <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-semibold">AI ORGANIZED</span>}
      </div>
      {children}
    </div>
  );
}

function Features() {
  const items = [
    { icon: MessageSquare, title: "SMS Auto-Parser", desc: "Reads every bank SMS and categorizes spend instantly. Zero manual entry." },
    { icon: TrendingUp, title: "Wealth Predictor", desc: "See your net worth in 10 years using a 15% CAGR growth model." },
    { icon: BarChart3, title: "Tax Mode", desc: "Compare Old vs New tax regime side by side and pick the savings winner." },
  ];
  return (
    <section className="mx-auto max-w-6xl px-5 sm:px-8 pb-20">
      <div className="grid md:grid-cols-3 gap-4">
        {items.map((f) => (
          <div key={f.title} className="rounded-2xl border border-border bg-surface/60 p-6 hover:border-primary/40 transition">
            <div className="size-10 rounded-lg bg-primary/10 grid place-items-center mb-4">
              <f.icon className="size-5 text-primary" />
            </div>
            <h3 className="font-bold text-lg">{f.title}</h3>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FinalCta({ onCta }: { onCta: () => void }) {
  return (
    <section className="mx-auto max-w-4xl px-5 sm:px-8 pb-24">
      <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-surface-elevated p-10 sm:p-14 text-center">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 size-64 rounded-full bg-primary/20 blur-3xl" />
        <h2 className="relative text-3xl sm:text-5xl font-black tracking-tight">Save your first ₹5,000 this month.</h2>
        <p className="relative mt-3 text-muted-foreground">Try FinFlow Premium for 48 hours. Costs less than a chai.</p>
        <button
          onClick={onCta}
          className="relative mt-8 inline-flex items-center gap-2 h-14 px-8 rounded-2xl bg-primary text-primary-foreground font-bold animate-pulse-glow"
        >
          Start ₹1 Trial <ArrowRight className="size-5" />
        </button>
      </div>
    </section>
  );
}
