import React, { useEffect, useRef } from 'react';
import './AnimatedBackground.css';

/**
 * AnimatedBackground - Subtle gradient background only
 * No floating words or animations
 */
const AnimatedBackground = () => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;

    const getTheme = () => {
      return document.documentElement.getAttribute('data-theme') || 'dark';
    };

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Subtle animated gradient background
    const animate = () => {
      timeRef.current += 0.002;
      const theme = getTheme();
      
      // Very subtle radial gradient
      const centerX = width * 0.5;
      const centerY = height * 0.5;
      const radius = Math.max(width, height) * 1.2;
      
      const gradient = ctx.createRadialGradient(
        centerX + Math.sin(timeRef.current) * width * 0.02,
        centerY + Math.cos(timeRef.current * 0.5) * height * 0.02,
        0,
        centerX,
        centerY,
        radius
      );

      // Theme-aware colors
      if (theme === 'light') {
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.5, '#f8fafc');
        gradient.addColorStop(1, '#ffffff');
      } else {
        // Dark navy with very subtle variation
        gradient.addColorStop(0, '#0d1117');
        gradient.addColorStop(0.5, '#0f1419');
        gradient.addColorStop(1, '#0d1117');
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Very subtle noise
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      const noiseIntensity = theme === 'light' ? 0.003 : 0.006;

      for (let i = 0; i < data.length; i += 4) {
        if (Math.random() < noiseIntensity) {
          const noise = (Math.random() - 0.5) * (theme === 'light' ? 3 : 5);
          data[i] = Math.max(0, Math.min(255, data[i] + noise));
          data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
          data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
        }
      }

      ctx.putImageData(imageData, 0, 0);

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="animated-background"
      style={{ pointerEvents: 'none' }}
    />
  );
};

export default AnimatedBackground;
