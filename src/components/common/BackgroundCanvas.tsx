import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  fadeSpeed: number;
  type: 'heart' | 'star' | 'circle';
  rotation: number;
  rotSpeed: number;
}

export const BackgroundCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Generate particles
    const particleCount = Math.min(Math.floor((width * height) / 18000), 55);
    const particles: Particle[] = [];

    const createParticle = (): Particle => ({
      x: Math.random() * width,
      y: Math.random() * height + height * 0.1,
      size: Math.random() * 12 + 6,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: -Math.random() * 0.7 - 0.2,
      opacity: Math.random() * 0.6 + 0.2,
      fadeSpeed: Math.random() * 0.003 + 0.001,
      type: Math.random() > 0.4 ? 'heart' : Math.random() > 0.5 ? 'star' : 'circle',
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.02,
    });

    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle());
    }

    const drawHeart = (
      context: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      color: string,
      rotation: number
    ) => {
      context.save();
      context.translate(x, y);
      context.rotate(rotation);
      context.beginPath();
      const topCurveHeight = size * 0.3;
      context.moveTo(0, topCurveHeight);
      // top left curve
      context.bezierCurveTo(
        -size / 2,
        -topCurveHeight,
        -size,
        size / 3,
        0,
        size
      );
      // top right curve
      context.bezierCurveTo(
        size,
        size / 3,
        size / 2,
        -topCurveHeight,
        0,
        topCurveHeight
      );
      context.fillStyle = color;
      context.fill();
      context.restore();
    };

    const drawStar = (
      context: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      color: string
    ) => {
      context.save();
      context.translate(x, y);
      context.beginPath();
      for (let i = 0; i < 5; i++) {
        context.lineTo(
          Math.cos(((18 + i * 72) * Math.PI) / 180) * size,
          -Math.sin(((18 + i * 72) * Math.PI) / 180) * size
        );
        context.lineTo(
          Math.cos(((54 + i * 72) * Math.PI) / 180) * (size / 2.5),
          -Math.sin(((54 + i * 72) * Math.PI) / 180) * (size / 2.5)
        );
      }
      context.closePath();
      context.fillStyle = color;
      context.fill();
      context.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotSpeed;

        if (p.y < -30 || p.x < -30 || p.x > width + 30) {
          p.y = height + 20;
          p.x = Math.random() * width;
          p.opacity = Math.random() * 0.5 + 0.2;
        }

        const roseGold = `rgba(224, 142, 157, ${p.opacity})`;
        const champagne = `rgba(244, 208, 104, ${p.opacity * 0.8})`;

        if (p.type === 'heart') {
          drawHeart(ctx, p.x, p.y, p.size, roseGold, p.rotation);
        } else if (p.type === 'star') {
          drawStar(ctx, p.x, p.y, p.size * 0.6, champagne);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.25, 0, Math.PI * 2);
          ctx.fillStyle = champagne;
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#f4d068';
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Dynamic Romantic Radial Gradients */}
      <div className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-radial from-[#7a1838]/25 via-transparent to-transparent blur-3xl animate-romantic-pulse" />
      <div className="absolute top-[40%] -right-[15%] w-[55vw] h-[55vw] rounded-full bg-radial from-[#4a102c]/30 via-transparent to-transparent blur-3xl animate-romantic-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute -bottom-[20%] left-[20%] w-[70vw] h-[70vw] rounded-full bg-radial from-[#5c0e2a]/20 via-transparent to-transparent blur-3xl animate-romantic-pulse" style={{ animationDelay: '1s' }} />

      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};
