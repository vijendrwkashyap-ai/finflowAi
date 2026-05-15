import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Lock, ShieldCheck, CreditCard } from "lucide-react";

export function PaymentModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const [paying, setPaying] = useState(false);

  const handlePay = () => {
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      onClose();
      navigate({ to: "/success" });
    }, 1400);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
          <motion.div
            initial={{ y: 30, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", damping: 22, stiffness: 280 }}
            className="relative w-full max-w-md rounded-2xl bg-surface-elevated border border-border shadow-2xl overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-md bg-blue-500 grid place-items-center text-white font-bold text-xs">R</div>
                <span className="font-semibold text-sm">Razorpay Secure Checkout</span>
              </div>
              <Lock className="size-4 text-muted-foreground" />
            </div>

            <div className="p-6 space-y-5">
              <div className="text-center">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Payable Amount</p>
                <p className="text-5xl font-black mt-2 font-display">
                  ₹<span className="text-primary">1</span>
                </p>
                <p className="text-sm text-muted-foreground mt-1">FinFlow • 2-Day Premium Trial</p>
              </div>

              <div className="rounded-xl border border-border bg-background/50 p-3 flex items-center gap-3">
                <CreditCard className="size-5 text-muted-foreground" />
                <div className="flex-1 text-sm">
                  <p className="font-medium">UPI / Card / NetBanking</p>
                  <p className="text-xs text-muted-foreground">All major methods accepted</p>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-secondary">Auto</span>
              </div>

              <button
                onClick={handlePay}
                disabled={paying}
                className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold text-base hover:opacity-95 active:scale-[0.99] transition disabled:opacity-70"
              >
                {paying ? "Processing…" : "Pay Now ₹1"}
              </button>

              <p className="text-[11px] leading-relaxed text-muted-foreground text-center">
                After 48 hours, subscription continues at ₹999/month. Cancel anytime from settings.
              </p>

              <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground pt-2 border-t border-border">
                <ShieldCheck className="size-3.5" /> Secured by 256-bit encryption
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
