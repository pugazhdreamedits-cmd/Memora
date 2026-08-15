import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, BookOpen, Map, TrendingDown, RefreshCw,
  Lightbulb, BarChart3, Clock, User, Settings, LogOut,
  ChevronLeft, ChevronRight, Dna, Zap, Menu, X
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { SimStore } from "@/lib/storage";
import { useSimulatedDays } from "@/hooks/useSimulatedDays";

const NAV = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Study Session", path: "/study", icon: BookOpen },
  { label: "Memory Landscape", path: "/landscape", icon: Map },
  { label: "Memory DNA", path: "/dna", icon: Dna },
  { label: "Retention Forecast", path: "/forecast", icon: TrendingDown },
  { label: "Recovery Mode", path: "/recovery", icon: RefreshCw },
  { label: "Insights", path: "/insights", icon: Lightbulb },
  { label: "Analytics", path: "/analytics", icon: BarChart3 },
  { label: "History", path: "/history", icon: Clock },
  { label: "Profile", path: "/profile", icon: User },
  { label: "Settings", path: "/settings", icon: Settings },
];

interface Props { children: React.ReactNode; }

export default function AppLayout({ children }: Props) {
  const { user, signOut, isDemo } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { offset, addDays, reset } = useSimulatedDays();

  const initials = user?.name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) ?? "??";

  return (
    <div className="flex h-screen overflow-hidden bg-bg-base">
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-bg-base/80 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:relative z-50 h-full flex flex-col bg-bg-surface border-r border-border-subtle transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-border-subtle">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 shrink-0 relative">
              <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <circle cx="16" cy="11" r="4" fill="#6366F1" opacity="0.9"/>
                <circle cx="9" cy="22" r="3" fill="#22D3EE" opacity="0.8"/>
                <circle cx="23" cy="22" r="3" fill="#22D3EE" opacity="0.8"/>
                <line x1="16" y1="11" x2="9" y2="22" stroke="#818CF8" strokeWidth="1.5" opacity="0.7"/>
                <line x1="16" y1="11" x2="23" y2="22" stroke="#818CF8" strokeWidth="1.5" opacity="0.7"/>
                <line x1="9" y1="22" x2="23" y2="22" stroke="#22D3EE" strokeWidth="1" opacity="0.5"/>
              </svg>
            </div>
            {!collapsed && <span className="font-bold text-lg tracking-wider gradient-text">MEMORA</span>}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex ml-auto p-1 rounded-lg hover:bg-bg-elevated text-text-muted hover:text-text-primary transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Demo Banner */}
        {isDemo && !collapsed && (
          <div className="mx-3 mt-3 px-3 py-2 rounded-lg bg-status-warning/5 border border-status-warning/20">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-status-warning shrink-0" />
              <span className="text-xs font-semibold text-status-warning">DEMO MODE</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {[1, 3, 7].map(d => (
                <button key={d} onClick={() => addDays(d)} className="text-xs px-2 py-0.5 rounded bg-status-warning/10 text-status-warning hover:bg-status-warning/20 transition-colors">
                  +{d}d
                </button>
              ))}
              {offset > 0 && (
                <button onClick={reset} className="text-xs px-2 py-0.5 rounded bg-border-subtle text-text-muted hover:bg-border-default transition-colors">
                  Reset
                </button>
              )}
            </div>
            {offset > 0 && <p className="text-xs text-text-muted mt-1">+{offset} days simulated</p>}
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 no-scrollbar">
          {NAV.map(({ label, path, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "nav-link mb-1",
                location.pathname === path && "active"
              )}
              title={collapsed ? label : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="text-sm">{label}</span>}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-border-subtle">
          <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
            <div className="w-8 h-8 rounded-full bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center text-xs font-bold text-brand-primary-light shrink-0">
              {initials}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{user?.name}</p>
                <p className="text-xs text-text-muted truncate">{user?.email}</p>
              </div>
            )}
            {!collapsed && (
              <button onClick={signOut} className="p-1.5 rounded-lg hover:bg-bg-elevated text-text-muted hover:text-status-danger transition-colors" title="Sign Out">
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center h-14 px-4 border-b border-border-subtle bg-bg-surface">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-bg-elevated text-text-secondary">
            <Menu className="w-5 h-5" />
          </button>
          <span className="ml-3 font-bold tracking-wider gradient-text">MEMORA</span>
          {isDemo && <span className="ml-auto demo-badge">DEMO</span>}
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="animate-in">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
