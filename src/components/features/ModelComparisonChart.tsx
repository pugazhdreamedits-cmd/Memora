import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell
} from "recharts";
import type { ModelMetrics } from "@/types";

interface Props {
  metrics: ModelMetrics[];
}

const COLORS = ["#6366F1", "#22D3EE", "#10B981"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-bg-elevated border border-border-default rounded-xl p-3 text-sm shadow-card">
      <p className="font-semibold text-text-primary mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: p.fill }} />
          <span className="text-text-secondary">{p.name}:</span>
          <span className="font-mono font-semibold text-text-primary">{(p.value * 100).toFixed(1)}%</span>
        </div>
      ))}
    </div>
  );
};

export default function ModelComparisonChart({ metrics }: Props) {
  const data = metrics.map(m => ({
    name: m.name.includes("Logistic") ? "Log. Reg." : m.name.includes("Decision") ? "Dec. Tree" : "Rand. Forest",
    Accuracy: m.accuracy,
    Precision: m.precision,
    Recall: m.recall,
    "F1 Score": m.f1Score,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 5, right: 16, left: 0, bottom: 5 }} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="name" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 1]} tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v * 100).toFixed(0)}%`} width={40} />
        <Tooltip content={<CustomTooltip />} />
        <Legend formatter={(v) => <span style={{ color: "#94A3B8", fontSize: 11 }}>{v}</span>} />
        <Bar dataKey="Accuracy" fill="#6366F1" radius={[4, 4, 0, 0]} />
        <Bar dataKey="F1 Score" fill="#22D3EE" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Precision" fill="#10B981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Recall" fill="#F59E0B" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
