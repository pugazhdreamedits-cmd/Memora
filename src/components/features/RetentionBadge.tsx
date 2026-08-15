import React from "react";
import { cn, getRiskBgColor } from "@/lib/utils";
import type { RiskLevel } from "@/types";

interface Props {
  risk: RiskLevel;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

const ICONS = { LOW: "●", MEDIUM: "◆", HIGH: "▲" };

export default function RetentionBadge({ risk, size = "md", showIcon = true }: Props) {
  const cls = getRiskBgColor(risk);
  const sizes = { sm: "text-xs px-2 py-0.5", md: "text-xs px-2.5 py-1", lg: "text-sm px-3 py-1.5" };

  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full font-semibold border", cls, sizes[size])}>
      {showIcon && <span className="text-[8px]">{ICONS[risk]}</span>}
      {risk}
    </span>
  );
}
