import React, { useEffect, useRef } from "react";
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);

  const riskColor = getRiskColor(risk);
  const mainColor = risk === "LOW" ? "#10B981" : risk === "MEDIUM" ? "#F59E0B" : "#EF4444";
  const secondaryColor = "#6366F1";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = size;
    const H = size;
    const cx = W / 2;
    const cy = H / 2;
    const r = (W / 2) * 0.72;

    function draw(t: number) {
      ctx.clearRect(0, 0, W, H);

      // Background circle
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.1, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(13, 17, 23, 0.95)";
      ctx.fill();

      // Outer ring glow
      const glowGrad = ctx.createRadialGradient(cx, cy, r * 0.7, cx, cy, r * 1.15);
      glowGrad.addColorStop(0, "transparent");
      glowGrad.addColorStop(1, `${mainColor}18`);
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.15, 0, Math.PI * 2);
      ctx.fillStyle = glowGrad;
      ctx.fill();

      // Track ring
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.lineWidth = 10;
      ctx.stroke();

      // Retention arc
      const startAngle = -Math.PI / 2;
      const endAngle = startAngle + (Math.PI * 2 * (retention / 100));
      const arcGrad = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
      arcGrad.addColorStop(0, secondaryColor);
      arcGrad.addColorStop(1, mainColor);
      ctx.beginPath();
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.strokeStyle = arcGrad;
      ctx.lineWidth = 10;
      ctx.lineCap = "round";
      ctx.stroke();

      // Stability inner ring
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.78, startAngle, startAngle + Math.PI * 2 * (stability / 100));
      ctx.strokeStyle = `${secondaryColor}60`;
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.stroke();

      // Consistency dots
      const numDots = 12;
      for (let i = 0; i < numDots; i++) {
        const angle = (i / numDots) * Math.PI * 2 - Math.PI / 2 + t * 0.0003;
        const filled = i < Math.round((consistency / 100) * numDots);
        const dx = cx + Math.cos(angle) * r * 0.58;
        const dy = cy + Math.sin(angle) * r * 0.58;
        ctx.beginPath();
        ctx.arc(dx, dy, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = filled ? `${mainColor}cc` : "rgba(255,255,255,0.08)";
        ctx.fill();
      }

      // Center value
      ctx.fillStyle = "#F1F5F9";
      ctx.font = `bold ${Math.floor(size * 0.18)}px Inter, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${Math.round(retention)}%`, cx, cy - 6);

      ctx.fillStyle = "#94A3B8";
      ctx.font = `${Math.floor(size * 0.065)}px Inter, sans-serif`;
      ctx.letterSpacing = "2px";
      ctx.fillText("RETENTION", cx, cy + Math.floor(size * 0.12));

      // Pulsing center dot
      const pulseR = 4 + Math.sin(t * 0.002) * 2;
      const pulseGrad = ctx.createRadialGradient(cx, cy - size * 0.13, 0, cx, cy - size * 0.13, pulseR * 2);
      pulseGrad.addColorStop(0, mainColor);
      pulseGrad.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.arc(cx, cy - size * 0.13, pulseR, 0, Math.PI * 2);
      ctx.fillStyle = pulseGrad;
      ctx.fill();
    }

    function animate(t: number) {
      timeRef.current = t;
      draw(t);
      animRef.current = requestAnimationFrame(animate);
    }

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [retention, risk, stability, consistency, size, mainColor, secondaryColor]);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="rounded-full"
        style={{ filter: `drop-shadow(0 0 20px ${mainColor}30)` }}
      />
    </div>
  );
}
