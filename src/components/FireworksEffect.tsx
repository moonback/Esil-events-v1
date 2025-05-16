import { useState, useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  velocity: {
    x: number;
    y: number;
  };
  size: number;
  hue: number;
  brightness: number;
  alpha: number;
}

class Firework {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  targetY: number;
  speed: { x: number; y: number };
  acceleration: number;
  particles: Particle[];
  particleCount: number;
  hue: number;
  exploded: boolean;
  friction: number;
  gravity: number;
  alpha: number;
  decay: number;
  lifetime: number;
  maxLifetime: number;

  constructor(canvas: HTMLCanvasElement, x?: number, y?: number) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get canvas context');
    this.ctx = context;
    
    // Initial position - starts from bottom of screen
    this.x = x ?? Math.random() * canvas.width;
    this.targetY = y ?? Math.random() * canvas.height * 0.5;
    this.y = canvas.height;
    
    this.speed = {
      x: Math.random() * 2 - 1,
      y: -Math.random() * 3 - 3
    };
    
    this.acceleration = 0.05;
    this.particles = [];
    this.particleCount = 80 + Math.floor(Math.random() * 40);
    this.hue = Math.floor(Math.random() * 360);
    this.exploded = false;
    this.friction = 0.98;
    this.gravity = 0.2;
    this.alpha = 1;
    this.decay = 0.015;
    this.lifetime = 0;
    this.maxLifetime = 200;
  }
  
  update() {
    this.lifetime++;
    
    if (!this.exploded) {
      // Move the firework rocket up
      this.x += this.speed.x;
      this.y += this.speed.y;
      this.speed.y += this.acceleration;
      
      // Check if it reached the target or stopped ascending
      if (this.y <= this.targetY || this.speed.y >= 0) {
        this.explode();
      }
      
      // Draw the rocket
      this.drawRocket();
    } else {
      // Update and draw particles
      let particlesAlive = false;
      
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        if (p.alpha > 0) {
          particlesAlive = true;
          
          p.velocity.x *= this.friction;
          p.velocity.y *= this.friction;
          p.velocity.y += this.gravity;
          
          p.x += p.velocity.x;
          p.y += p.velocity.y;
          p.alpha -= this.decay;
          
          this.drawParticle(p);
        }
      }
      
      if (!particlesAlive || this.lifetime > this.maxLifetime) {
        this.alpha = 0; // Mark for removal
      }
    }
    
    return this.alpha > 0;
  }
  
  drawRocket() {
    this.ctx.save();
    this.ctx.beginPath();
    // Trail effect
    this.ctx.fillStyle = `hsla(${this.hue}, 100%, 60%, ${this.alpha})`;
    this.ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.closePath();
    this.ctx.restore();
  }
  
  drawParticle(particle: Particle) {
    this.ctx.save();
    this.ctx.globalAlpha = particle.alpha;
    this.ctx.globalCompositeOperation = 'lighter';
    this.ctx.fillStyle = `hsla(${particle.hue}, 100%, ${particle.brightness}%, ${particle.alpha})`;
    
    this.ctx.beginPath();
    this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.closePath();
    this.ctx.restore();
  }
  
  explode() {
    this.exploded = true;
    
    // Create particles in all directions
    for (let i = 0; i < this.particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      
      this.particles.push({
        x: this.x,
        y: this.y,
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed
        },
        size: Math.random() * 2 + 1,
        hue: this.hue + Math.random() * 30 - 15,
        brightness: Math.random() * 30 + 70,
        alpha: 1
      });
    }
  }
}

const FireworksEffect = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const fireworksList: Firework[] = [];
    let lastTimestamp = 0;
    
    // Set canvas to full screen
    const resizeCanvas = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    // Animation loop
    const animate = (timestamp: number) => {
      if (!canvas || !ctx) return;
      
      // Clear the canvas completely with transparency
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Launch new fireworks at random intervals
      if (timestamp - lastTimestamp > 500 && Math.random() > 0.95) {
        lastTimestamp = timestamp;
        fireworksList.push(new Firework(canvas));
      }
      
      // Update and draw fireworks
      for (let i = fireworksList.length - 1; i >= 0; i--) {
        if (!fireworksList[i].update()) {
          fireworksList.splice(i, 1);
        }
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);
  
  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
      />
    </div>
  );
};

export default FireworksEffect;