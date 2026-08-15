import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, Zap } from "lucide-react";
import { login, register, getSession } from "@/lib/auth";
import { DEMO_USER_EMAIL, DEMO_PASSWORD } from "@/constants";
import NeuralBackground from "@/components/features/NeuralBackground";
import { cn } from "@/lib/utils";

export default function Auth() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [mode, setMode] = useState<"login" | "register">(
    params.get("mode") === "register" ? "register" : "login"
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getSession()) navigate("/dashboard");
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise(r => setTimeout(r, 300));

    const result = mode === "login"
      ? login(email.trim(), password)
      : register(name.trim(), email.trim(), password);

    setLoading(false);

    if (!result.success) {
      setError(result.error ?? "An error occurred.");
      return;
    }

    // Check onboarding
    const { ProfileStore } = await import("@/lib/storage");
    const profile = ProfileStore.getByUser(result.user!.id);
    if (!profile?.onboardingCompleted) {
      navigate("/onboarding");
    } else {
      navigate("/dashboard");
    }
  };

  const loginAsDemo = () => {
    setEmail(DEMO_USER_EMAIL);
    setPassword(DEMO_PASSWORD);
    setMode("login");
  };

  return (
    <div className="relative min-h-screen bg-bg-base flex items-center justify-center p-4">
      <NeuralBackground intensity={0.3} />
      <div className="absolute inset-0 bg-hero-gradient pointer-events-none" />

      <div className="relative w-full max-w-md z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
              <circle cx="16" cy="11" r="4" fill="#6366F1" opacity="0.9"/>
              <circle cx="9" cy="22" r="3" fill="#22D3EE" opacity="0.8"/>
              <circle cx="23" cy="22" r="3" fill="#22D3EE" opacity="0.8"/>
              <line x1="16" y1="11" x2="9" y2="22" stroke="#818CF8" strokeWidth="1.5" opacity="0.7"/>
              <line x1="16" y1="11" x2="23" y2="22" stroke="#818CF8" strokeWidth="1.5" opacity="0.7"/>
              <line x1="9" y1="22" x2="23" y2="22" stroke="#22D3EE" strokeWidth="1" opacity="0.5"/>
            </svg>
            <span className="font-black text-2xl tracking-widest gradient-text">MEMORA</span>
          </Link>
          <p className="mt-2 text-text-muted text-sm">Learn. Remember. Predict.</p>
        </div>

        <div className="glass-elevated rounded-2xl p-8">
          {/* Tabs */}
          <div className="flex rounded-xl bg-bg-surface p-1 mb-6">
            {(["login", "register"] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                className={cn(
                  "flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all",
                  mode === m ? "bg-brand-primary text-white shadow-glow-primary" : "text-text-secondary hover:text-text-primary"
                )}
              >
                {m === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Full Name</label>
                <input
                  type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Your name" className="input-field" required
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" className="input-field" required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={mode === "register" ? "Min. 6 characters" : "Your password"}
                  className="input-field pr-10" required
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-status-danger/10 border border-status-danger/20 text-status-danger text-sm">
                <span className="mt-0.5">⚠</span>
                <span>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === "login" ? "Sign In" : "Create Account"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-border-subtle">
            <button onClick={loginAsDemo}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-status-warning/30 text-status-warning text-sm font-medium hover:bg-status-warning/5 transition-colors">
              <Zap className="w-4 h-4" />
              Enter Demo Mode
            </button>
            <p className="text-center text-xs text-text-muted mt-2">
              Explore with pre-seeded data. No real data used.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
