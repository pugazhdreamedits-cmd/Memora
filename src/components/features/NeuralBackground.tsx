import React, { useEffect, useRef } from "react";

interface Node {
  x: number; y: number; vx: number; vy: number;
  r: number; brightness: number; phase: number;
}

export default function NeuralBackground({ intensity = 0.4 }: { intensity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const nodeCount = Math.min(Math.floor((W * H) / 18000), 55);
    const nodes: Node[] = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: 2 + Math.random() * 3,
      brightness: 0.3 + Math.random() * 0.7,
      phase: Math.random() * Math.PI * 2,
    }));

    const onResize = () => {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W; canvas.height = H;
    };
    window.addEventListener("resize", onResize);

    let t = 0;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      t += 0.008;

      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0 || node.x > W) node.vx *= -1;
        if (node.y < 0 || node.y > H) node.vy *= -1;
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 160) {
            const alpha = (1 - dist / 160) * intensity * 0.4;
            const useSecondary = (i + j) % 3 === 0;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = useSecondary ? `rgba(34,211,238,${alpha})` : `rgba(99,102,241,${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      for (const node of nodes) {
        const pulse = 0.6 + 0.4 * Math.sin(t + node.phase);
        const useSecondary = node.phase > Math.PI;
        const color = useSecondary ? "34,211,238" : "99,102,241";
        const alpha = node.brightness * pulse * intensity;

        const grad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.r * 2.5);
        grad.addColorStop(0, `rgba(${color},${alpha})`);
        grad.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color},${alpha * 1.5})`;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
