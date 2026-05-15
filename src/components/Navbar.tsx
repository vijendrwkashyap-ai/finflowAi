import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const links = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Tracker" },
  { to: "/predictor", label: "Wealth" },
  { to: "/tax", label: "Tax" },
];

export function Navbar() {
  const { location } = useRouterState();
  const { user, signOut } = useAuth();
  const nav = useNavigate();

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border">
      <div className="mx-auto max-w-7xl flex items-center justify-between px-5 sm:px-8 h-16">
        <Link to="/" className="flex items-center gap-2">
          <motion.div
            initial={{ rotate: -10, scale: 0.9 }}
            animate={{ rotate: 0, scale: 1 }}
            className="size-8 rounded-lg bg-[var(--gradient-emerald)] grid place-items-center font-black text-primary-foreground"
          >
            F
          </motion.div>
          <span className="font-display font-bold text-lg tracking-tight">FinFlow</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => {
            const active = location.pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  active ? "text-foreground bg-secondary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          {user && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-semibold text-primary bg-primary/10 border border-primary/20 px-2 py-1 rounded-full">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full size-1.5 bg-primary" />
              </span>
              LIVE
            </span>
          )}
          {user ? (
            <button
              onClick={async () => { await signOut(); nav({ to: "/" }); }}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-3 py-2 rounded-lg border border-border hover:bg-secondary transition"
              title={user.email ?? ""}
            >
              <LogOut className="size-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          ) : (
            <Link
              to="/auth"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition"
            >
              <UserIcon className="size-3.5" />
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
