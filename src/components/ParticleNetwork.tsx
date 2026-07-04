import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export default function ParticleNetwork() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number | null; y: number | null }>({ x: null, y: null });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationFrameId: number;

    // Sizing handling via ResizeObserver as instructed
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      
      canvas.width = width;
      canvas.height = height;

      // Adjust particle count proportional to screensize
      const particleCount = Math.min(Math.floor((width * height) / 12000), 80);
      initParticles(particleCount, width, height);
    });

    resizeObserver.observe(container);

    // Initialise particles
    const initParticles = (count: number, width: number, height: number) => {
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.4, // ultra subtle speed
          vy: (Math.random() - 0.5) * 0.4,
          radius: Math.random() * 1.5 + 1,
        });
      }
    };

    // Track Mouse coordinates relative to the canvas
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: null, y: null };
    };

    window.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    // Draw and animate loop
    const animate = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;

      // Draw all lines first
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];

        // Draw connections between nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const distSq = (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2;
          const maxDist = 110;
          const maxDistSq = maxDist * maxDist;

          if (distSq < maxDistSq) {
            const dist = Math.sqrt(distSq);
            const alpha = (1 - dist / maxDist) * 0.12;
            ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`; // Subtle purple connections
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        // Connect particles to mouse proximity
        if (mouseX !== null && mouseY !== null) {
          const mDistSq = (p1.x - mouseX) ** 2 + (p1.y - mouseY) ** 2;
          const mouseMaxDist = 160;
          const mouseMaxDistSq = mouseMaxDist * mouseMaxDist;

          if (mDistSq < mouseMaxDistSq) {
            const mDist = Math.sqrt(mDistSq);
            const alpha = (1 - mDist / mouseMaxDist) * 0.25;
            ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`; // Blue magnetic visual pull line
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouseX, mouseY);
            ctx.stroke();

            // Slight magnetic pull towards cursor
            const force = (mouseMaxDist - mDist) / mouseMaxDist;
            const angle = Math.atan2(mouseY - p1.y, mouseX - p1.x);
            p1.x += Math.cos(angle) * force * 0.45;
            p1.y += Math.sin(angle) * force * 0.45;
          }
        }
      }

      // Draw and update particle positions
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        // Bounce back from boundaries
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Clamp inside canvas boundary box to handle resizing safely
        p.x = Math.max(0, Math.min(width, p.x));
        p.y = Math.max(0, Math.min(height, p.y));

        ctx.fillStyle = 'rgba(168, 85, 247, 0.45)'; // Subtle purple dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden z-1"
      id="particle-network-container"
    >
      <canvas 
        ref={canvasRef} 
        className="block w-full h-full opacity-60"
        id="particle-network-canvas"
      />
    </div>
  );
}
