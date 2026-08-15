import React, { useMemo } from "react";
import { cn, getRiskColor } from "@/lib/utils";
import type { RiskLevel } from "@/types";

interface Props {
  retention: number;
  risk: RiskLevel;
  stability: number;
  consistency: number;
  size?: number;
}

export default function MemoryCore({ retention, risk, stability, consistency, size = 220 }: Props) {
  const mainColor = useMemo(() => (risk === "LOW" ? "#6366F1" : risk === "MEDIUM" ? "#F59E0B" : "#EF4444"), [risk]);
  const accent = "#22D3EE"; // cyan accent

  const insufficient = retention <= 0 && stability <= 0 && consistency <= 0;

  const coreState = retention >= 80 ? "stable" : retention >= 50 ? "medium" : "low";

  const radius = size / 2;
  const viewBox = `0 0 ${size} ${size}`;

  return (
    <div
      className={cn("relative flex items-center justify-center", insufficient && "opacity-80")}
      style={{ width: size, height: size }}
      role="img"
      aria-label={insufficient ? "Memory profile forming" : `Overall retention ${Math.round(retention)} percent; risk ${risk}`}
    >
      <svg viewBox={viewBox} width={size} height={size} className="rounded-full" aria-hidden={false}>
        <defs>
          <radialGradient id="coreGlow" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor={mainColor} stopOpacity={0.9} />
            <stop offset="60%" stopColor={mainColor} stopOpacity={0.12} />
            <stop offset="100%" stopColor="transparent" stopOpacity={0} />
          </radialGradient>
          <radialGradient id="accentGlow" cx="30%" cy="70%" r="60%">
            <stop offset="0%" stopColor={accent} stopOpacity={0.7} />
            <stop offset="70%" stopColor={accent} stopOpacity={0.06} />
            <stop offset="100%" stopColor="transparent" stopOpacity={0} />
          </radialGradient>
          <filter id="softBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feBlend in="SourceGraphic" in2="blur" mode="screen" />
          </filter>
        </defs>

        {/* Dark glass background circle */}
        <circle cx={radius} cy={radius} r={radius * 0.9} fill="rgba(10,12,15,0.65)" stroke="rgba(36,52,71,0.5)" strokeWidth="1" />

        {/* Outer orbital rings (3) */}
        <g className="orbital-group" style={{ transformOrigin: `${radius}px ${radius}px` }}>
          <ellipse cx={radius} cy={radius} rx={radius * 0.85} ry={radius * 0.6} fill="none" stroke={`rgba(99,102,241,0.06)`} strokeWidth={1} />
          <ellipse cx={radius} cy={radius} rx={radius * 0.65} ry={radius * 0.45} fill="none" stroke={`rgba(34,211,238,0.04)`} strokeWidth={1} />
          <ellipse cx={radius} cy={radius} rx={radius * 0.45} ry={radius * 0.32} fill="none" stroke={`rgba(99,102,241,0.03)`} strokeWidth={1} />
        </g>

        {/* Neural nodes scattered on rings */}
        <g className="nodes" aria-hidden>
          {[...Array(10)].map((_, i) => {
            const angle = (i / 10) * Math.PI * 2;
            const r = radius * (0.5 + (i % 3) * 0.12);
            const x = radius + Math.cos(angle) * r;
            const y = radius + Math.sin(angle) * r;
            const active = i < Math.round((consistency / 100) * 10);
            return (
              <circle key={i} cx={x} cy={y} r={active ? 3.4 : 2.2} fill={active ? mainColor : "rgba(255,255,255,0.06)"} opacity={active ? 1 : 0.8} />
            );
          })}
        </g>

        {/* Central glowing core */}
        <g className={cn("core-group", coreState)}>
          <circle cx={radius} cy={radius} r={radius * 0.28} fill="url(#coreGlow)" filter="url(#softBlur)" />
          <circle cx={radius} cy={radius} r={radius * 0.18} fill="rgba(7,8,11,0.9)" stroke={mainColor} strokeOpacity={0.18} strokeWidth={1} />

          {/* Retention numeric */}
          {!insufficient ? (
            <g className="label-group" aria-hidden>
              <text x={radius} y={radius - 6} textAnchor="middle" fill="#F1F5F9" fontWeight={700} fontSize={Math.max(18, size * 0.14)} fontFamily="Inter, sans-serif">
                {Math.round(retention)}%
              </text>
              <text x={radius} y={radius + Math.max(18, size * 0.05)} textAnchor="middle" fill="#94A3B8" fontSize={Math.max(10, size * 0.05)} fontFamily="Inter, sans-serif">
                RETENTION
              </text>
            </g>
          ) : (
            <g className="label-group" aria-hidden>
              <text x={radius} y={radius - 6} textAnchor="middle" fill="#F1F5F9" fontWeight={600} fontSize={Math.max(12, size * 0.11)} fontFamily="Inter, sans-serif">
                Memory profile
              </text>
              <text x={radius} y={radius + Math.max(18, size * 0.05)} textAnchor="middle" fill="#94A3B8" fontSize={Math.max(10, size * 0.045)} fontFamily="Inter, sans-serif">
                forming
              </text>
            </g>
          )}
        </g>

        {/* Accent glow */}
        <circle cx={radius * 0.72} cy={radius * 1.1} r={radius * 0.7} fill="url(#accentGlow)" opacity={0.7} />
      </svg>

      {/* Hover overlay with stability and risk */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="opacity-0 hover:opacity-100 pointer-events-auto transition-opacity duration-200 text-center" role="status" aria-hidden={insufficient}>
          {!insufficient && (
            <div className="bg-bg-elevated/70 glass-panel px-3 py-2 rounded-xl text-xs">
              <div className="font-semibold text-text-primary">{risk} — {coreState.toUpperCase()}</div>
              <div className="text-text-muted text-xs">Stability {Math.round(stability)}% · Consistency {Math.round(consistency)}%</div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .orbital-group { animation: orbit 20s linear infinite; }
        .nodes { transform-origin: ${radius}px ${radius}px; animation: rotateNodes 14s linear infinite reverse; }
        .core-group.stable { animation: none; }
        .core-group.medium { animation: pulse 3s ease-in-out infinite; }
        .core-group.low { animation: pulse 2s ease-in-out infinite; filter: saturate(0.6) brightness(0.9); }
        @keyframes orbit { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes rotateNodes { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
        @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.02); opacity: 0.95; } 100% { transform: scale(1); opacity: 1; } }
        @media (prefers-reduced-motion: reduce) {
          .orbital-group, .nodes, .core-group.medium, .core-group.low { animation: none !important; }
        }
        .label-group { pointer-events: none; }
      `}</style>
    </div>
  );
}
