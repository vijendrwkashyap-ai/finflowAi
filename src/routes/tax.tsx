import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/tax")({
  head: () => ({ meta: [{ title: "Tax Mode — FinFlow" }] }),
  component: Tax,
});

function calcOld(income: number, c80: number = 150000) {
  // Simplified old regime with std deduction 50k + 80C up to 150k
  const taxable = Math.max(0, income - 50000 - Math.min(150000, c80));
  let tax = 0;
  const slabs = [[250000, 0], [500000, 0.05], [1000000, 0.2], [Infinity, 0.3]] as const;
  let prev = 0;
  let rem = taxable;
  for (const [limit, rate] of slabs) {
    const span = Math.min(rem, limit - prev);
    if (span <= 0) break;
    tax += span * rate;
    rem -= span;
    prev = limit;
    if (rem <= 0) break;
  }
  return Math.round(tax);
}

function calcNew(income: number) {
  const taxable = Math.max(0, income - 75000);
  if (taxable <= 700000) return 0;
  let tax = 0;
  const slabs = [[300000, 0], [700000, 0.05], [1000000, 0.10], [1200000, 0.15], [1500000, 0.20], [Infinity, 0.30]] as const;
  let prev = 0;
  let rem = taxable;
  for (const [limit, rate] of slabs) {
    const span = Math.min(rem, limit - prev);
    if (span <= 0) break;
    tax += span * rate;
    rem -= span;
    prev = limit;
    if (rem <= 0) break;
  }
  return Math.round(tax);
}

function Tax() {
  const [income, setIncome] = useState(1200000);
  const [c80, setC80] = useState(100000);
  const oldTax = useMemo(() => calcOld(income, c80), [income, c80]);
  const newTax = useMemo(() => calcNew(income), [income]);
  const winner = newTax < oldTax ? "new" : "old";
  const savings = Math.abs(oldTax - newTax);

  // 80C optimisation insight
  const remaining80C = Math.max(0, 150000 - c80);
  const oldAtMax = useMemo(() => calcOld(income, 150000), [income]);
  const potentialSave = Math.max(0, oldTax - oldAtMax);

  return (
    <PageShell>
      <section className="mx-auto max-w-5xl px-5 sm:px-8 py-8 md:py-12">
        <p className="text-xs uppercase tracking-widest text-primary">Tool</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight">Tax Optimizer</h1>
        <p className="mt-2 text-muted-foreground text-sm">Old vs New regime + smart 80C insights — instantly.</p>

        <div className="mt-6 rounded-2xl border border-border bg-surface-elevated p-5 sm:p-6 space-y-5">
          <div>
            <div className="flex justify-between items-baseline mb-2">
              <label className="text-sm text-muted-foreground">Annual Income</label>
              <span className="font-bold text-xl">₹{income.toLocaleString("en-IN")}</span>
            </div>
            <input
              type="range"
              min={300000}
              max={5000000}
              step={50000}
              value={income}
              onChange={(e) => setIncome(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
          <div>
            <div className="flex justify-between items-baseline mb-2">
              <label className="text-sm text-muted-foreground">80C Investments (PPF, ELSS, EPF…)</label>
              <span className="font-bold">₹{c80.toLocaleString("en-IN")}</span>
            </div>
            <input
              type="range"
              min={0}
              max={150000}
              step={5000}
              value={c80}
              onChange={(e) => setC80(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <p className="mt-1.5 text-[11px] text-muted-foreground">Limit: ₹1,50,000 per year</p>
          </div>
        </div>

        <div className="mt-5 grid sm:grid-cols-2 gap-4">
          <RegimeCard title="Old Tax Regime" subtitle="With deductions (80C, std)" tax={oldTax} winner={winner === "old"} />
          <RegimeCard title="New Tax Regime" subtitle="Lower rates, fewer deductions" tax={newTax} winner={winner === "new"} />
        </div>

        {remaining80C > 0 && potentialSave > 0 && (
          <motion.div
            key={remaining80C}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 rounded-2xl border border-amber-400/30 bg-amber-400/[0.06] p-5"
          >
            <p className="text-[10px] uppercase tracking-widest text-amber-400 font-bold">SMART INSIGHT</p>
            <p className="mt-1 text-base sm:text-lg font-bold">
              Investment in 80C is low. Invest{" "}
              <span className="text-amber-400">₹{remaining80C.toLocaleString("en-IN")}</span> more to save{" "}
              <span className="text-primary">₹{potentialSave.toLocaleString("en-IN")}</span> in tax this year.
            </p>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Try ELSS funds (3-yr lock-in) or PPF for tax-free returns.
            </p>
          </motion.div>
        )}

        <motion.div
          key={winner + savings}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-2xl border border-primary/30 bg-primary/5 p-5 text-center"
        >
          <p className="text-sm text-muted-foreground">Recommendation</p>
          <p className="mt-1 text-lg sm:text-xl font-bold">
            Pick the <span className="text-primary capitalize">{winner} Regime</span> — save ₹{savings.toLocaleString("en-IN")}/year
          </p>
        </motion.div>
      </section>
    </PageShell>
  );
}

function RegimeCard({ title, subtitle, tax, winner }: { title: string; subtitle: string; tax: number; winner: boolean }) {
  return (
    <div className={`rounded-2xl border p-6 transition ${winner ? "border-primary bg-surface-elevated glow-emerald" : "border-border bg-surface/60"}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg">{title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        </div>
        {winner && <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-bold">BEST</span>}
      </div>
      <div className="mt-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Tax Payable</p>
        <p className="mt-1 text-3xl sm:text-4xl font-black">₹{tax.toLocaleString("en-IN")}</p>
      </div>
    </div>
  );
}
