import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from "recharts";
import { Target, TrendingUp } from "lucide-react";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/predictor")({
  head: () => ({ meta: [{ title: "Wealth Engine — FinFlow" }] }),
  component: Predictor,
});

type Mode = "grow" | "target";

function Predictor() {
  const [mode, setMode] = useState<Mode>("grow");

  // GROW mode
  const [monthly, setMonthly] = useState(10000);
  const [rate, setRate] = useState(15);

  // TARGET mode
  const [target, setTarget] = useState(10000000); // 1 Cr
  const [years, setYears] = useState(15);
  const [tRate, setTRate] = useState(15);

  const data = useMemo(() => {
    const out: { year: string; value: number }[] = [];
    let total = 0;
    for (let y = 0; y <= 10; y++) {
      out.push({ year: `Y${y}`, value: Math.round(total) });
      total = (total + monthly * 12) * (1 + rate / 100);
    }
    return out;
  }, [monthly, rate]);

  const final = data[data.length - 1].value;

  // Required monthly SIP to hit target in N years at rate r (annual, compounded annually approx)
  const requiredSIP = useMemo(() => {
    const r = tRate / 100;
    // FV of annuity = SIP*12 * ((1+r)^n - 1) / r → solve for SIP
    const factor = (Math.pow(1 + r, years) - 1) / r;
    const annual = target / factor;
    return Math.max(0, Math.round(annual / 12));
  }, [target, years, tRate]);

  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-5 sm:px-8 py-8 md:py-12">
        <p className="text-xs uppercase tracking-widest text-primary">Tool</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight">Wealth Engine</h1>
        <p className="mt-2 text-muted-foreground text-sm">Predict your wealth — or reverse-engineer your dream.</p>

        {/* Mode tabs */}
        <div className="mt-5 inline-flex p-1 rounded-xl bg-secondary text-xs font-semibold">
          <button
            onClick={() => setMode("grow")}
            className={`px-4 py-2 rounded-lg inline-flex items-center gap-1.5 transition ${mode === "grow" ? "bg-background text-foreground shadow" : "text-muted-foreground"}`}
          >
            <TrendingUp className="size-3.5" /> Predict Growth
          </button>
          <button
            onClick={() => setMode("target")}
            className={`px-4 py-2 rounded-lg inline-flex items-center gap-1.5 transition ${mode === "target" ? "bg-background text-foreground shadow" : "text-muted-foreground"}`}
          >
            <Target className="size-3.5" /> Reach a Target
          </button>
        </div>

        {mode === "grow" ? (
          <div className="mt-6 grid lg:grid-cols-[320px_1fr] gap-5">
            <div className="rounded-2xl border border-border bg-surface-elevated p-5 sm:p-6 space-y-6">
              <Slider label="Monthly Investment" value={monthly} min={1000} max={100000} step={1000} fmt={(v) => `₹${v.toLocaleString("en-IN")}`} onChange={setMonthly} />
              <Slider label="Annual Return" value={rate} min={5} max={25} step={1} fmt={(v) => `${v}%`} onChange={setRate} />
              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground uppercase tracking-widest">In 10 years</p>
                <p className="mt-1 text-3xl font-black text-primary">₹{(final / 100000).toFixed(1)}L</p>
                <p className="text-xs text-muted-foreground mt-1">≈ ₹{final.toLocaleString("en-IN")}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface-elevated p-3 sm:p-6 h-[340px] sm:h-[420px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.72 0.18 158)" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="oklch(0.72 0.18 158)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" />
                  <XAxis dataKey="year" stroke="oklch(0.7 0 0)" fontSize={12} />
                  <YAxis stroke="oklch(0.7 0 0)" fontSize={12} tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`} />
                  <Tooltip
                    contentStyle={{ background: "oklch(0.13 0.008 260)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 12 }}
                    labelStyle={{ color: "oklch(0.7 0 0)" }}
                    formatter={(v) => [`₹${Number(v).toLocaleString("en-IN")}`, "Net Worth"]}
                  />
                  <Area type="monotone" dataKey="value" stroke="oklch(0.78 0.20 158)" strokeWidth={2.5} fill="url(#grad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="mt-6 grid lg:grid-cols-[1fr_1fr] gap-5">
            <div className="rounded-2xl border border-border bg-surface-elevated p-5 sm:p-6 space-y-6">
              <Slider label="Target Amount" value={target} min={500000} max={50000000} step={500000} fmt={(v) => `₹${(v / 100000).toFixed(0)}L`} onChange={setTarget} />
              <Slider label="In how many years" value={years} min={3} max={30} step={1} fmt={(v) => `${v} yrs`} onChange={setYears} />
              <Slider label="Expected Return" value={tRate} min={6} max={20} step={1} fmt={(v) => `${v}%`} onChange={setTRate} />
            </div>

            <motion.div
              key={requiredSIP}
              initial={{ scale: 0.97, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/[0.08] to-transparent p-6 sm:p-8 flex flex-col justify-center"
            >
              <p className="text-xs uppercase tracking-widest text-primary">You need to invest</p>
              <p className="mt-2 text-5xl sm:text-6xl font-black tracking-tight">
                ₹{requiredSIP.toLocaleString("en-IN")}
                <span className="text-lg text-muted-foreground font-bold">/mo</span>
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                To reach <strong className="text-foreground">₹{(target / 100000).toFixed(0)}L</strong> in{" "}
                <strong className="text-foreground">{years} years</strong> at{" "}
                <strong className="text-primary">{tRate}% p.a.</strong>
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <Stat k="Total Invested" v={`₹${((requiredSIP * 12 * years) / 100000).toFixed(1)}L`} />
                <Stat k="Wealth Gained" v={`₹${((target - requiredSIP * 12 * years) / 100000).toFixed(1)}L`} />
              </div>
            </motion.div>
          </div>
        )}
      </section>
    </PageShell>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl bg-background/40 border border-border p-3">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{k}</p>
      <p className="mt-1 font-bold text-primary">{v}</p>
    </div>
  );
}

function Slider({ label, value, min, max, step, fmt, onChange }: { label: string; value: number; min: number; max: number; step: number; fmt: (v: number) => string; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-2">
        <label className="text-sm text-muted-foreground">{label}</label>
        <span className="font-bold text-foreground">{fmt(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary"
      />
    </div>
  );
}
