import React from "react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip
} from "recharts";
import type { MemoryProfile } from "@/types";

interface Props {
  profile: MemoryProfile;
}

export default function RadarDNA({ profile }: Props) {
  const data = [
    { metric: "Retention Speed", value: profile.retentionSpeed, fullMark: 100 },
    { metric: "Long-Term Memory", value: profile.longTermRetention, fullMark: 100 },
    { metric: "Revision Response", value: profile.revisionResponse, fullMark: 100 },
    { metric: "Consistency", value: profile.consistency, fullMark: 100 },
    { metric: "Forgetting Resistance", value: 100 - profile.forgettingSpeed, fullMark: 100 },
  ];

  return (
    <ResponsiveContainer width="100%" height={320}>
      <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <defs>
          <linearGradient id="radarGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6366F1" stopOpacity={0.6} />
            <stop offset="100%" stopColor="#22D3EE" stopOpacity={0.6} />
          </linearGradient>
        </defs>
        <PolarGrid stroke="rgba(255,255,255,0.08)" />
        <PolarAngleAxis
          dataKey="metric"
          tick={{ fill: "#94A3B8", fontSize: 11 }}
        />
        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#475569", fontSize: 10 }} />
        <Tooltip
          formatter={(value: number) => [`${value.toFixed(0)}%`, ""]}
          contentStyle={{ background: "#131923", border: "1px solid #243447", borderRadius: 12, fontSize: 12 }}
          labelStyle={{ color: "#F1F5F9", fontWeight: 600 }}
        />
        <Radar
          name="Memory DNA"
          dataKey="value"
          stroke="#6366F1"
          fill="url(#radarGrad)"
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
