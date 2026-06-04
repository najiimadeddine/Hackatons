import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Zap, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background aurora */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-primary/[0.08] rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-violet-600/[0.07] rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-dot-pattern opacity-[0.025]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 text-center px-6 max-w-lg"
      >
        {/* Glowing 404 */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6"
        >
          <span
            className="text-[120px] md:text-[160px] font-black leading-none select-none"
            style={{
              background: "linear-gradient(135deg, rgba(59,130,246,0.6) 0%, rgba(139,92,246,0.6) 50%, rgba(6,182,212,0.6) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 0 40px rgba(59,130,246,0.3))",
            }}
          >
            404
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/[0.1] bg-white/[0.04] text-muted-foreground text-[11px] font-semibold uppercase tracking-widest mb-6">
            <Search size={10} /> Page Not Found
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-4">
            You've gone off the grid
          </h1>
          <p className="text-muted-foreground text-base font-light mb-10 leading-relaxed">
            This page doesn't exist — or maybe it does in a parallel hackathon universe. Let's get you back on track.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <Button className="btn-primary-glow h-11 px-6 rounded-xl font-semibold gap-2 border border-primary/40">
                <Home size={15} />
                Back to Home
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="h-11 px-6 rounded-xl font-semibold gap-2 border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.06]">
                <Zap size={15} className="text-primary" />
                Open Dashboard
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Decorative floating orbs */}
        <motion.div
          animate={{ y: [-8, 8, -8], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-16 -left-16 w-24 h-24 bg-primary/10 rounded-full blur-2xl"
        />
        <motion.div
          animate={{ y: [6, -6, 6], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-12 -right-12 w-20 h-20 bg-violet-500/10 rounded-full blur-2xl"
        />
      </motion.div>
    </div>
  );
}
