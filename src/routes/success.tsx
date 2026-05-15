import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  Check,
  Download,
  ShieldCheck,
  Smartphone,
  Share,
  Plus,
  Sparkles,
} from "lucide-react";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/success")({
  head: () => ({ meta: [{ title: "Payment Successful — FinFlow" }] }),
  component: Success,
});

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type Phase = "downloading" | "ready" | "installed";

function Success() {
  const [phase, setPhase] = useState<Phase>("downloading");
  const [progress, setProgress] = useState(0);
  const [deferred, setDeferred] = useState<InstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSHelp, setShowIOSHelp] = useState(false);
  const startedAt = useRef<number>(Date.now());

  // Detect iOS for manual Add-to-Home-Screen instructions
  useEffect(() => {
    const ua = window.navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) && !("MSStream" in window);
    setIsIOS(ios);
  }, []);

  // Capture the PWA install prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as InstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    const installed = () => setPhase("installed");
    window.addEventListener("appinstalled", installed);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);

  // Fake download animation — feels like a real APK download
  useEffect(() => {
    if (phase !== "downloading") return;
    let raf = 0;
    const tick = () => {
      const elapsed = Date.now() - startedAt.current;
      const pct = Math.min(100, (elapsed / 3200) * 100);
      setProgress(pct);
      if (pct < 100) {
        raf = requestAnimationFrame(tick);
      } else {
        setTimeout(() => setPhase("ready"), 350);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  const handleInstall = () => {
    // Direct link to the APK file
    window.location.href = "/finflow.apk";
    toast.success("Downloading APK...");
  };

  const downloadedKB = Math.round((progress / 100) * 18420); // pretend 18 MB

  return (
    <PageShell>
      <section className="mx-auto max-w-md px-5 py-10 text-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 14, stiffness: 200 }}
          className="mx-auto size-20 rounded-full bg-primary/15 grid place-items-center glow-emerald"
        >
          <div className="size-14 rounded-full bg-primary grid place-items-center">
            <Check className="size-8 text-primary-foreground" strokeWidth={3} />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-3xl font-black tracking-tight"
        >
          Payment Successful
        </motion.h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Welcome to FinFlow Premium. Your 48-hour trial has started.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-8 rounded-3xl border border-primary/30 bg-surface-elevated p-6 text-left"
        >
          <AnimatePresence mode="wait">
            {phase === "downloading" && (
              <motion.div
                key="dl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-xl bg-primary/15 grid place-items-center shrink-0">
                    <Download className="size-5 text-primary animate-pulse" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">FinFlow_Pro_v2.4.apk</p>
                    <p className="text-[11px] text-muted-foreground">
                      {(downloadedKB / 1024).toFixed(1)} MB of 18.0 MB
                    </p>
                  </div>
                  <span className="text-sm font-bold text-primary tabular-nums">
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="mt-4 h-2 rounded-full bg-background overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-primary/70"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-3 text-[11px] text-muted-foreground inline-flex items-center gap-1">
                  <ShieldCheck className="size-3 text-primary" />
                  Secure download · Verified by FinFlow
                </p>
              </motion.div>
            )}

            {phase === "ready" && (
              <motion.div
                key="ready"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="size-11 rounded-xl bg-primary grid place-items-center shrink-0">
                    <Check className="size-6 text-primary-foreground" strokeWidth={3} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold">Download complete</p>
                    <p className="text-[11px] text-muted-foreground">
                      One last step — install FinFlow on your home screen
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleInstall}
                  className="w-full inline-flex items-center justify-center gap-2 h-14 px-5 rounded-2xl bg-primary text-primary-foreground font-extrabold text-base animate-pulse-glow active:scale-[0.97] transition"
                >
                  <Download className="size-5" />
                  DOWNLOAD ANDROID APK
                </button>

                <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                  {[
                    { k: "Size", v: "0 MB" },
                    { k: "Offline", v: "Yes" },
                    { k: "Native", v: "100%" },
                  ].map((s) => (
                    <div
                      key={s.k}
                      className="rounded-xl bg-background/50 border border-border py-2"
                    >
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                        {s.k}
                      </p>
                      <p className="text-sm font-bold text-primary mt-0.5">{s.v}</p>
                    </div>
                  ))}
                </div>

                <p className="mt-4 text-[11px] text-muted-foreground inline-flex items-center gap-1">
                  <ShieldCheck className="size-3 text-primary" />
                  Device-Level Processing · 100% Private
                </p>
              </motion.div>
            )}

            {phase === "installed" && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-2"
              >
                <div className="mx-auto size-14 rounded-full bg-primary/15 grid place-items-center">
                  <Sparkles className="size-7 text-primary" />
                </div>
                <p className="mt-4 text-base font-bold">FinFlow installed</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Open it from your home screen anytime.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence>
          {showIOSHelp && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-5 rounded-2xl border border-border bg-surface-elevated p-4 text-left"
            >
              <p className="text-sm font-bold mb-3">Add FinFlow to Home Screen</p>
              <ol className="space-y-2.5 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="size-5 rounded-md bg-primary/15 text-primary font-bold grid place-items-center text-[10px] shrink-0">
                    1
                  </span>
                  <span>
                    Tap the <Share className="inline size-3.5 mx-0.5 text-primary" />{" "}
                    Share button at the bottom of {isIOS ? "Safari" : "your browser"}.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="size-5 rounded-md bg-primary/15 text-primary font-bold grid place-items-center text-[10px] shrink-0">
                    2
                  </span>
                  <span>
                    Scroll and tap{" "}
                    <Plus className="inline size-3.5 mx-0.5 text-primary" />
                    <strong className="text-foreground"> Add to Home Screen</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="size-5 rounded-md bg-primary/15 text-primary font-bold grid place-items-center text-[10px] shrink-0">
                    3
                  </span>
                  <span>
                    Tap <strong className="text-foreground">Add</strong> — FinFlow icon
                    appears on your home screen.
                  </span>
                </li>
              </ol>
            </motion.div>
          )}
        </AnimatePresence>

        <Link
          to="/dashboard"
          className="mt-6 inline-block text-sm font-semibold text-primary active:scale-95 transition"
        >
          Or preview the web dashboard →
        </Link>
      </section>
    </PageShell>
  );
}
