import { ShieldCheck } from "lucide-react";
import { Navbar } from "./Navbar";
import { BottomNav } from "./BottomNav";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pb-24 md:pb-0">{children}</main>

      <div className="md:hidden fixed bottom-[68px] inset-x-0 z-40 flex justify-center pointer-events-none px-4">
        <div className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full bg-background/85 backdrop-blur-md border border-border px-3 py-1 text-[10px] text-muted-foreground">
          <ShieldCheck className="size-3 text-primary" />
          Device-Level Processing · 100% Private
        </div>
      </div>

      <footer className="hidden md:block border-t border-border py-8 text-center text-xs text-muted-foreground">
        <div className="inline-flex items-center gap-1.5">
          <ShieldCheck className="size-3.5 text-primary" />
          Device-Level Processing · 100% Private · © 2026 FinFlow AI
        </div>
      </footer>

      <BottomNav />
    </div>
  );
}
