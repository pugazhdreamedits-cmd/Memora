import React from "react";
import { cn, getRiskColor } from "@/lib/utils";
import type { TopicMemoryProfile } from "@/types";

interface Props {
  topic: TopicMemoryProfile;
  onClick?: () => void;
  selected?: boolean;
}

export default function TopicNode({ topic, onClick, selected }: Props) {
  const color = getRiskColor(topic.forgettingRisk);
  const size = 44 + (topic.retentionScore / 100) * 32; // 44-76px
  const isPulsing = topic.forgettingRisk === "HIGH";

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center justify-center rounded-full transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-base",
        selected ? "scale-110 z-10" : "hover:scale-105",
      )}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color}20 0%, ${color}08 70%, transparent 100%)`,
        border: `1.5px solid ${color}${selected ? "cc" : "60"}`,
        boxShadow: selected ? `0 0 20px ${color}50` : `0 0 8px ${color}20`,
        animation: isPulsing ? "pulse-slow 3s cubic-bezier(0.4,0,0.6,1) infinite" : undefined,
      }}
      title={`${topic.topic} — ${topic.retentionScore}%`}
    >
      <span className="text-white font-bold text-xs leading-none">{Math.round(topic.retentionScore)}%</span>
    </button>
  );
}
