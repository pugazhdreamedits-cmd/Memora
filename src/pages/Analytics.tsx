import React, { useMemo } from "react";
import { BarChart3, RefreshCw } from "lucide-react";
import { useRequireAuth } from "@/hooks/useAuth";
import { MLStore, MetricsStore } from "@/lib/storage";
import { trainModels, getCachedMetrics, getDefaultMetrics } from "@/lib/ml";
import ModelComparisonChart from "@/components/features/ModelComparisonChart";
import { RetentionStore, StudyStore } from "@/lib/storage";
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from "recharts";
import { round, getRiskColor } from "@/lib/utils";
import type { ModelMetrics } from "@/types";

const CT = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-bg-elevated border border-border-default rounded-xl p-3 text-xs shadow-card">
      {payload.map((p: any) => (
        <div key={p.name} className="flex gap-2 mb-0.5">
          <span className="text-text-muted">{p.name}:</span>
          <span className="font-mono font-bold text-text-primary">{typeof p.value === "number" ? p.value.toFixed(1) : p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function Analytics() {
  const { user } = useRequireAuth();

  const { metrics, scatterData, retentionDist, methodData, hasEnough } = useMemo(() => {
    if (!user) return { metrics: getDefaultMetrics(), scatterData: [], retentionDist: [], methodData: [], hasEnough: false };

    const mlData = MLStore.getByUser(user.id);
    let m: ModelMetrics[];

    if (mlData.length >= 5) {
      m = trainModels(mlData);
      MetricsStore.set(m);
    } else {
      m = MetricsStore.get() ?? getDefaultMetrics();
    }

    const scatter = mlData.map(d => ({
      duration: d.studyDuration,
      retention: d.retentionScore,
      difficulty: ["Easy", "Medium", "Hard"][d.difficulty] ?? "Medium",
    }));

    const dist = [
      { name: "High (80-100%)", value: mlData.filter(d => d.retentionScore >= 80).length, color: "#10B981" },
      { name: "Medium (50-79%)", value: mlData.filter(d => d.retentionScore >= 50 && d.retentionScore < 80).length, color: "#F59E0B" },
      { name: "Low (<50%)", value: mlData.filter(d => d.retentionScore < 50).length, color: "#EF4444" },
    ];

    const mMap: Record<number, { count: number; total: number }> = {};
    for (const d of mlData) {
      if (!mMap[d.studyMethod]) mMap[d.studyMethod] = { count: 0, total: 0 };
      mMap[d.studyMethod].count++;
      mMap[d.studyMethod].total += d.retentionScore;
    }
    const methodNames = ["Reading", "Practice", "Video", "Notes", "Flashcards", "Problem Solving"];
    const mData = Object.entries(mMap).map(([k, v]) => ({
      method: methodNames[parseInt(k)] ?? `Method ${k}`,
      avgRetention: round(v.total / v.count),
    }));

    return { metrics: m, scatterData: scatter, retentionDist: dist, methodData: mData, hasEnough: mlData.length >= 3 };
  }, [user]);

  if (!user) return null;

  const bestModel = metrics.reduce((b, m) => m.f1Score > b.f1Score ? m : b);

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <BarChart3 className="w-6 h-6 text-brand-primary-light" />
          <h1 className="text-2xl font-bold text-text-primary">Analytics</h1>
        </div>
        <p className="text-text-secondary text-sm">Model performance, retention distribution, and behavioral patterns.</p>
        {!hasEnough && (
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-status-warning/10 border border-status-warning/20 text-status-warning text-xs">
            Showing reference metrics — add more sessions for personalized model evaluation.
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Model Comparison */}
        <div className="glass-elevated rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-heading">Model Performance Comparison</h2>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-status-success/10 border border-status-success/20 text-xs text-status-success font-semibold">
              Best: {bestModel.name}
            </div>
          </div>
          <ModelComparisonChart metrics={metrics} />
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border-subtle">
                  {["Model", "Accuracy", "Precision", "Recall", "F1 Score", "MAE", "RMSE", "R²"].map(h => (
                    <th key={h} className="text-left px-3 py-2 text-text-muted uppercase tracking-wider font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {metrics.map(m => (
                  <tr key={m.name} className={`border-b border-border-subtle/50 ${m === bestModel ? "bg-status-success/5" : ""}`}>
                    <td className="px-3 py-2 font-medium text-text-primary flex items-center gap-2">
                      {m === bestModel && <span className="text-status-success">★</span>}
                      {m.name}
                    </td>
                    {[m.accuracy, m.precision, m.recall, m.f1Score].map((v, i) => (
                      <td key={i} className="px-3 py-2 font-mono text-text-secondary">{(v * 100).toFixed(1)}%</td>
                    ))}
                    {[m.mae, m.rmse, m.r2].map((v, i) => (
                      <td key={i} className="px-3 py-2 font-mono text-text-secondary">{v.toFixed(3)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Retention Distribution */}
          <div className="glass-elevated rounded-2xl p-6">
            <h2 className="section-heading mb-4">Retention Distribution</h2>
            {retentionDist.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={retentionDist} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}>
                    {retentionDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#131923", border: "1px solid #243447", borderRadius: 12, fontSize: 12 }} />
                  <Legend formatter={(v) => <span style={{ color: "#94A3B8", fontSize: 11 }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-40 text-text-muted text-sm">Not enough data</div>
            )}
          </div>

          {/* Study Method vs Retention */}
          <div className="glass-elevated rounded-2xl p-6">
            <h2 className="section-heading mb-4">Study Method vs Avg Retention</h2>
            {methodData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={methodData} margin={{ top: 5, right: 10, left: 0, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="method" tick={{ fill: "#94A3B8", fontSize: 10 }} angle={-30} textAnchor="end" axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: "#94A3B8", fontSize: 11 }} tickFormatter={v => `${v}%`} width={36} />
                  <Tooltip content={<CT />} />
                  <Bar dataKey="avgRetention" radius={[4, 4, 0, 0]} name="Avg Retention">
                    {methodData.map((d, i) => (
                      <Cell key={i} fill={d.avgRetention >= 70 ? "#10B981" : d.avgRetention >= 50 ? "#F59E0B" : "#EF4444"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-40 text-text-muted text-sm">Not enough data</div>
            )}
          </div>
        </div>

        {/* Duration vs Retention Scatter */}
        {scatterData.length > 2 && (
          <div className="glass-elevated rounded-2xl p-6">
            <h2 className="section-heading mb-4">Study Duration vs Retention</h2>
            <ResponsiveContainer width="100%" height={220}>
              <ScatterChart margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="duration" name="Duration (min)" tick={{ fill: "#94A3B8", fontSize: 11 }} label={{ value: "Study Duration (min)", fill: "#475569", fontSize: 11, position: "insideBottom", offset: -5 }} axisLine={false} />
                <YAxis dataKey="retention" name="Retention %" domain={[0, 100]} tick={{ fill: "#94A3B8", fontSize: 11 }} tickFormatter={v => `${v}%`} width={40} />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} content={<CT />} />
                <Scatter data={scatterData} fill="#6366F1" opacity={0.7} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* How MEMORA Predicts section */}
        <div className="glass-elevated rounded-2xl p-6">
          <h2 className="section-heading mb-4">How MEMORA Predicts Your Retention</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-text-secondary mb-3">Input Features</h3>
              <ul className="space-y-1.5 text-xs text-text-muted">
                {["Study duration", "Topic difficulty", "Study method", "Initial self-assessment score",
                  "Revision count", "Days since study", "Previous retention score",
                  "Quiz score & accuracy", "Quiz completion time"].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-secondary mb-3">Pipeline</h3>
              <div className="space-y-2 text-xs">
                {[
                  { step: "1", label: "Data Collection", desc: "Study sessions + quiz performance" },
                  { step: "2", label: "Preprocessing", desc: "Normalization, encoding, train/test split" },
                  { step: "3", label: "Model Training", desc: "LR + Decision Tree + Random Forest" },
                  { step: "4", label: "Model Selection", desc: "Best F1 Score selected automatically" },
                  { step: "5", label: "Prediction", desc: "Retention probability → risk → recommendation" },
                ].map(({ step, label, desc }) => (
                  <div key={step} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded bg-brand-primary/20 text-brand-primary-light font-bold flex items-center justify-center shrink-0">{step}</span>
                    <div>
                      <span className="font-medium text-text-secondary">{label}</span>
                      <span className="text-text-muted ml-1">— {desc}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-text-muted p-3 rounded-xl bg-bg-base/50 border border-border-subtle">
                Predictions are model estimates. Quality depends on available training data volume and variety. Risk thresholds (80/50%) are application-defined, not scientifically universal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
