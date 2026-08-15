import React, { useState } from "react";
import { Settings as SettingsIcon, Save, Trash2, AlertTriangle } from "lucide-react";
import { useRequireAuth } from "@/hooks/useAuth";
import { SettingsStore, SimStore } from "@/lib/storage";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function Settings() {
  const { user } = useRequireAuth();
  const { signOut } = useAuth();
  const [settings, setSettings] = useState(SettingsStore.get());
  const [showReset, setShowReset] = useState(false);

  if (!user) return null;

  const save = () => {
    SettingsStore.set(settings);
    toast.success("Settings saved.");
  };

  const clearSimDays = () => {
    SimStore.setOffset(0);
    toast.success("Demo day simulation reset to Day 0.");
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <SettingsIcon className="w-6 h-6 text-brand-primary-light" />
          <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        </div>
        <p className="text-text-secondary text-sm">Application preferences and account management.</p>
      </div>

      <div className="space-y-6">
        {/* Risk Thresholds */}
        <div className="glass-elevated rounded-2xl p-6">
          <h2 className="section-heading mb-2">Risk Thresholds</h2>
          <p className="text-xs text-text-muted mb-4">
            Application-defined thresholds for forgetting risk classification. These are not scientifically universal values.
          </p>
          <div className="space-y-4">
            <div>
              <label className="flex items-center justify-between text-sm mb-2">
                <span className="text-text-secondary">LOW risk above</span>
                <span className="font-mono text-status-success">{settings.riskThresholds?.low ?? 80}%</span>
              </label>
              <input type="range" min={60} max={95} step={5}
                value={settings.riskThresholds?.low ?? 80}
                onChange={e => setSettings((s: any) => ({ ...s, riskThresholds: { ...s.riskThresholds, low: parseInt(e.target.value) } }))}
                className="w-full accent-status-success" />
            </div>
            <div>
              <label className="flex items-center justify-between text-sm mb-2">
                <span className="text-text-secondary">MEDIUM risk above</span>
                <span className="font-mono text-status-warning">{settings.riskThresholds?.medium ?? 50}%</span>
              </label>
              <input type="range" min={25} max={75} step={5}
                value={settings.riskThresholds?.medium ?? 50}
                onChange={e => setSettings((s: any) => ({ ...s, riskThresholds: { ...s.riskThresholds, medium: parseInt(e.target.value) } }))}
                className="w-full accent-status-warning" />
            </div>
          </div>
        </div>

        {/* Demo Mode */}
        <div className="glass-elevated rounded-2xl p-6">
          <h2 className="section-heading mb-4">Demo Mode</h2>
          <div className="flex items-start gap-3 p-3 rounded-xl bg-status-warning/5 border border-status-warning/20 mb-4">
            <AlertTriangle className="w-4 h-4 text-status-warning mt-0.5 shrink-0" />
            <p className="text-xs text-text-secondary">
              Demo mode uses pre-seeded student data. Simulated days allow testing the forgetting curve without real-time waiting. Demo data is clearly labeled and never mixed with real records.
            </p>
          </div>
          <button onClick={clearSimDays} className="btn-secondary flex items-center gap-2 text-sm">
            Reset Simulated Days to Day 0
          </button>
        </div>

        {/* Save */}
        <button onClick={save} className="btn-primary flex items-center gap-2 w-full justify-center">
          <Save className="w-4 h-4" /> Save Settings
        </button>

        {/* Danger Zone */}
        <div className="glass-elevated rounded-2xl p-6 border border-status-danger/20">
          <h2 className="text-sm font-semibold text-status-danger mb-4">Danger Zone</h2>
          <div className="space-y-3">
            <button onClick={signOut} className="w-full py-2.5 rounded-xl border border-status-danger/30 text-status-danger text-sm font-medium hover:bg-status-danger/5 transition-colors">
              Sign Out
            </button>
          </div>
        </div>

        {/* Limitations */}
        <div className="glass-panel rounded-2xl p-6 text-xs text-text-muted space-y-2">
          <h3 className="text-sm font-semibold text-text-secondary mb-3">Project Limitations & Disclaimer</h3>
          <p>• Predictions are model estimates and not guaranteed outcomes.</p>
          <p>• Risk thresholds (80/50%) are application-defined, not scientifically validated.</p>
          <p>• Prediction quality depends on quantity and quality of collected data.</p>
          <p>• Memory is influenced by many factors not captured by this system (sleep, stress, context).</p>
          <p>• Dataset size is limited to individual user data — larger datasets improve model accuracy.</p>
          <p>• This is a Data Science mini-project for educational purposes.</p>
        </div>
      </div>
    </div>
  );
}
