import React, { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ChevronDown, Zap, Brain, TrendingDown, RefreshCw } from "lucide-react";
import NeuralBackground from "@/components/features/NeuralBackground";
import { getSession } from "@/lib/auth";

export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    const session = getSession();
    if (session) navigate("/dashboard");
  }, [navigate]);

  return (
    <div className="relative min-h-screen bg-bg-base overflow-hidden">
      <NeuralBackground intensity={0.5} />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-40 pointer-events-none" style={{ zIndex: 1 }} />

      {/* Hero gradient */}
      <div className="absolute inset-0 bg-hero-gradient pointer-events-none" style={{ zIndex: 1 }} />

      {/* Nav */}
      <nav className="relative flex items-center justify-between px-6 md:px-12 py-5" style={{ zIndex: 10 }}>
        <div className="flex items-center gap-3">
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
            <circle cx="16" cy="11" r="4" fill="#6366F1" opacity="0.9"/>
            <circle cx="9" cy="22" r="3" fill="#22D3EE" opacity="0.8"/>
            <circle cx="23" cy="22" r="3" fill="#22D3EE" opacity="0.8"/>
            <line x1="16" y1="11" x2="9" y2="22" stroke="#818CF8" strokeWidth="1.5" opacity="0.7"/>
            <line x1="16" y1="11" x2="23" y2="22" stroke="#818CF8" strokeWidth="1.5" opacity="0.7"/>
            <line x1="9" y1="22" x2="23" y2="22" stroke="#22D3EE" strokeWidth="1" opacity="0.5"/>
          </svg>
          <span className="font-bold text-xl tracking-widest gradient-text">MEMORA</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/auth" className="text-sm text-text-secondary hover:text-text-primary transition-colors font-medium">
            Sign In
          </Link>
          <Link to="/auth?mode=register" className="btn-primary text-sm py-2">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative flex flex-col items-center justify-center min-h-[85vh] text-center px-6" style={{ zIndex: 5 }}>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary-light text-sm font-medium mb-8 animate-slide-up">
          <Zap className="w-3.5 h-3.5" />
          <span>Powered by Machine Learning · No API Keys Required</span>
        </div>

        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-6 animate-slide-up"
          style={{ animationDelay: "0.1s" }}>
          <span className="gradient-text">MEMORA</span>
        </h1>

        <p className="text-lg md:text-2xl text-text-secondary font-light tracking-[0.15em] mb-4 animate-slide-up"
          style={{ animationDelay: "0.2s" }}>
          YOUR MEMORY HAS A PATTERN.
        </p>

        <p className="max-w-xl text-text-secondary text-base md:text-lg leading-relaxed mb-10 animate-slide-up"
          style={{ animationDelay: "0.3s" }}>
          MEMORA learns how <em>you</em> retain information, predicts when your memory will decline,
          and recommends exactly when you should revise.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <Link to="/auth?mode=register" className="btn-primary flex items-center gap-2 text-base px-8 py-4 shadow-glow-primary">
            ENTER MEMORA
            <ArrowRight className="w-5 h-5" />
          </Link>
          <a href="#how-it-works" className="btn-secondary text-base px-8 py-4">
            HOW IT WORKS
          </a>
        </div>

        <div className="flex items-center gap-6 mt-12 animate-slide-up" style={{ animationDelay: "0.5s" }}>
          {[
            { label: "ML Models", value: "3" },
            { label: "Recall Checkpoints", value: "4" },
            { label: "External APIs", value: "0" },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <div className="text-2xl font-black gradient-text">{value}</div>
              <div className="text-xs text-text-muted uppercase tracking-widest mt-1">{label}</div>
            </div>
          ))}
        </div>

        <a href="#how-it-works" className="absolute bottom-8 left-1/2 -translate-x-1/2 text-text-muted hover:text-text-secondary transition-colors animate-float">
          <ChevronDown className="w-6 h-6" />
        </a>
      </div>

      {/* How it works */}
      <section id="how-it-works" className="relative py-24 px-6 md:px-12" style={{ zIndex: 5 }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">How MEMORA Predicts</h2>
            <p className="text-text-secondary max-w-lg mx-auto">
              A transparent ML pipeline — from your study behavior to personalized revision timing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Brain, title: "Study Session", desc: "Log your study session with topic, method, and self-assessment.", color: "#6366F1" },
              { icon: Zap, title: "Initial Quiz", desc: "Complete a short quiz. Your score seeds your personal retention model.", color: "#22D3EE" },
              { icon: TrendingDown, title: "ML Prediction", desc: "Random Forest, Decision Tree & Logistic Regression forecast your decay curve.", color: "#F59E0B" },
              { icon: RefreshCw, title: "Smart Revision", desc: "MEMORA recommends your optimal revision time based on your individual profile.", color: "#10B981" },
            ].map(({ icon: Icon, title, desc, color }, i) => (
              <div key={title} className="memora-card relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-5 group-hover:opacity-10 transition-opacity"
                  style={{ background: color, transform: "translate(30%, -30%)" }} />
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${color}18`, border: `1px solid ${color}40` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div className="text-xs text-text-muted font-bold tracking-widest uppercase mb-1">Step {i + 1}</div>
                <h3 className="font-semibold text-text-primary mb-2">{title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* Pipeline diagram */}
          <div className="mt-16 glass-panel rounded-2xl p-6 md:p-8">
            <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest mb-6 text-center">Data Pipeline</h3>
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
              {["Study Session", "→", "Initial Quiz", "→", "Dataset", "→", "Preprocessing", "→",
                "ML Training", "→", "Retention Forecast", "→", "Forgetting Risk", "→", "Revision Recommendation"].map((item, i) => (
                <span key={i} className={item === "→"
                  ? "text-text-muted"
                  : "px-3 py-1.5 rounded-lg bg-brand-primary/10 border border-brand-primary/20 text-brand-primary-light font-medium"
                }>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 px-6 text-center" style={{ zIndex: 5 }}>
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Start Building Your Memory Profile
          </h2>
          <p className="text-text-secondary mb-8">
            MEMORA needs data to predict. The more sessions you complete, the more accurate your personal model becomes.
          </p>
          <Link to="/auth?mode=register" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-4">
            Begin Your First Session
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="mt-4 text-sm text-text-muted">
            Try with demo account — no real data needed.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-8 px-6 border-t border-border-subtle text-center" style={{ zIndex: 5 }}>
        <p className="text-text-muted text-sm">
          <span className="gradient-text font-bold">MEMORA</span>
          {" "}— Learn. Remember. Predict. · Data Science Project · Predictions are model estimates, not guarantees.
        </p>
      </footer>
    </div>
  );
}
