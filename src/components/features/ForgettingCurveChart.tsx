import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine, Area, AreaChart, ComposedChart
} from "recharts";

interface DataPoint {
  label: string;
  actual?: number | null;
  predicted: number;
}

interface Props {
  data: DataPoint[];
  title?: string;
  recommendedLabel?: string | null;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-bg-elevated border border-border-default rounded-xl p-3 text-sm shadow-card">
      <p className="font-semibold text-text-primary mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-text-secondary">{p.name}:</span>
          <span className="font-mono font-semibold" style={{ color: p.color }}>
            {typeof p.value === "number" ? `${p.value.toFixed(1)}%` : "—"}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function ForgettingCurveChart({ data, title, recommendedLabel = null }: Props) {
  return (
    <div className="w-full">
      {title && <p className="text-sm font-medium text-text-secondary mb-4">{title}</p>}
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={data} margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366F1" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="predGlow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6366F1" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#22D3EE" stopOpacity={0.25} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="label" tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} width={40} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => <span style={{ color: "#94A3B8", fontSize: 12 }}>{value}</span>}
          />
          <ReferenceLine y={80} stroke="#10B981" strokeDasharray="4 4" strokeOpacity={0.4} label={{ value: "LOW", fill: "#10B981", fontSize: 10, position: "right" }} />
          <ReferenceLine y={50} stroke="#F59E0B" strokeDasharray="4 4" strokeOpacity={0.4} label={{ value: "MED", fill: "#F59E0B", fontSize: 10, position: "right" }} />
          {/* Predicted curve with soft glow */}
          <Area type="monotone" dataKey="predicted" fill="url(#predGrad)" stroke="#6366F1" strokeWidth={2} name="Predicted" dot={false} />
          <Line type="monotone" dataKey="predicted" stroke="url(#predGlow)" strokeWidth={2.5} strokeDasharray="6 6" name="Predicted (trend)" dot={false} />
          {/* Actual points (sparse) */}
          <Line type="monotone" dataKey="actual" stroke="#22D3EE" strokeWidth={2.5} name="Actual" dot={{ r: 4, fill: "#22D3EE", strokeWidth: 0 }} connectNulls={false} />

          {/* Highlight recommended revision window if label provided */}
          {/** recommendedLabel should match one of the data.label values (e.g., 'Now', '+1d') **/}
          {/** We'll render a translucent ReferenceArea from 'Now' to recommendedLabel if available **/}
          {recommendedLabel && data.some(d => d.label === recommendedLabel) && (
            <ReferenceArea x1={data[0].label} x2={recommendedLabel} strokeOpacity={0} fill="#6366F140" />
          )}
        </ComposedChart>
      </ResponsiveContainer>
      {recommendedLabel && (
        <div className="mt-3 flex items-center gap-3">
          <div className="px-3 py-2 rounded-lg bg-brand-primary/10 text-brand-primary-light font-semibold">OPTIMAL REVISION WINDOW</div>
          <div className="text-sm text-text-muted">Target: <span className="font-medium text-text-primary">{recommendedLabel}</span></div>
        </div>
      )}
    </div>
  );
}
