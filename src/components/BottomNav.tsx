import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Receipt, Sparkles, TrendingUp, Calculator } from "lucide-react";

const tabs = [
  { to: "/", label: "Home", icon: Home },
  { to: "/dashboard", label: "Tracker", icon: Receipt },
  { to: "/ai", label: "AI", icon: Sparkles },
  { to: "/predictor", label: "Wealth", icon: TrendingUp },
  { to: "/tax", label: "Tax", icon: Calculator },
] as const;

export function BottomNav() {
  const { location } = useRouterState();
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-border bg-background/85 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-5">
        {tabs.map((t) => {
          const active = location.pathname === t.to;
          return (
            <li key={t.to}>
              <Link
                to={t.to}
                className={`flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors active:bg-secondary/60 ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <t.icon className={`size-5 transition-transform ${active ? "scale-110" : ""}`} strokeWidth={active ? 2.5 : 2} />
                <span className="tracking-wide">{t.label}</span>
                {active && <span className="absolute top-0 h-0.5 w-8 rounded-b bg-primary" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
