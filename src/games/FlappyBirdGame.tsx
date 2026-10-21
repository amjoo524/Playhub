import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameInfo } from '../types';
import { GameWrapper } from '../components/GameWrapper';
import { useSound } from '../hooks/useSound';
import { Play } from 'lucide-react';

interface Pipe {
  x: number;
  topHeight: number;
  gap: number;
  passed: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  radius: number;
  alpha: number;
}

export const FlappyBirdGame: React.FC<{ game: GameInfo }> = ({ game }) => {
  const { play } = useSound();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [hasStarted, setHasStarted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);

  // Constants
  const CANVAS_WIDTH = 380;
  const CANVAS_HEIGHT = 500;
  const GROUND_HEIGHT = 45;
  const BIRD_X = 85;
  const BIRD_RADIUS = 15;
  const GRAVITY = 0.36;
  const JUMP_IMPULSE = -6.5;
  const TERMINAL_VELOCITY = 9;
  const PIPE_WIDTH = 58;
  const PIPE_SPAWN_INTERVAL = 100; // frames (~1.6s)

  // Game state refs (for synchronous 60fps canvas loop)
  const birdYRef = useRef(CANVAS_HEIGHT / 2 - 40);
  const velocityRef = useRef(0);
  const rotationRef = useRef(0);
  const pipesRef = useRef<Pipe[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const frameCountRef = useRef(0);
  const groundOffsetRef = useRef(0);
  const wingPhaseRef = useRef(0);
  const reqIdRef = useRef(0);
  const scoreRef = useRef(0);

  // Jump/Flap Action
  const jump = useCallback(() => {
    if (isGameOver || isPaused) return;

    if (!hasStarted) {
      setHasStarted(true);
    }

    velocityRef.current = JUMP_IMPULSE;
    rotationRef.current = -0.45; // ~ -25 deg
    wingPhaseRef.current = 1;
    play('move');
  }, [hasStarted, isGameOver, isPaused, play]);

  // Reset Game
  const resetGame = useCallback(() => {
    birdYRef.current = CANVAS_HEIGHT / 2 - 40;
    velocityRef.current = 0;
    rotationRef.current = 0;
    pipesRef.current = [
      {
        x: CANVAS_WIDTH + 80,
        topHeight: 140,
        gap: 130,
        passed: false,
      },
    ];
    particlesRef.current = [];
    frameCountRef.current = 0;
    groundOffsetRef.current = 0;
    scoreRef.current = 0;
    setScore(0);
    setIsGameOver(false);
    setIsPaused(false);
    setHasStarted(true);
  }, []);

  // Keyboard handlers (Space & ArrowUp)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ([' ', 'ArrowUp'].includes(e.key)) {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jump]);

  // Main 60fps Physics & Render Loop
  useEffect(() => {
    if (!hasStarted || isPaused || isGameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = () => {
      frameCountRef.current++;
      groundOffsetRef.current = (groundOffsetRef.current + 2.4) % 24;

      // --- 1. BIRD PHYSICS ---
      velocityRef.current = Math.min(velocityRef.current + GRAVITY, TERMINAL_VELOCITY);
      birdYRef.current += velocityRef.current;

      // Rotation smoothly tilts downward when falling
      if (velocityRef.current < 0) {
        rotationRef.current = Math.max(-0.45, rotationRef.current - 0.05);
      } else {
        rotationRef.current = Math.min(1.2, rotationRef.current + 0.04);
      }

      // Flap wing animation
      wingPhaseRef.current = Math.sin(frameCountRef.current * 0.35);

      // --- 2. GROUND & CEILING COLLISION ---
      const ceilingY = BIRD_RADIUS;
      const groundY = CANVAS_HEIGHT - GROUND_HEIGHT;

      if (birdYRef.current - BIRD_RADIUS <= ceilingY) {
        birdYRef.current = ceilingY + BIRD_RADIUS;
        velocityRef.current = 0;
      }

      if (birdYRef.current + BIRD_RADIUS >= groundY) {
        // Crash on ground
        play('hit');
        triggerCrashParticles(BIRD_X, groundY);
        setIsGameOver(true);
        return;
      }

      // --- 3. RANDOMIZED PIPE GENERATION ---
      const pipeSpeed = 2.4 + Math.min(scoreRef.current * 0.04, 1.8);

      if (frameCountRef.current % PIPE_SPAWN_INTERVAL === 0) {
        const minTop = 60;
        const currentGap = Math.max(115, 135 - Math.min(scoreRef.current * 0.8, 20));
        const maxTop = CANVAS_HEIGHT - GROUND_HEIGHT - currentGap - 60;
        const topHeight = Math.floor(Math.random() * (maxTop - minTop + 1)) + minTop;

        pipesRef.current.push({
          x: CANVAS_WIDTH,
          topHeight,
          gap: currentGap,
          passed: false,
        });
      }

      // --- 4. PIPE MOVEMENT & COLLISION CHECK ---
      for (let i = 0; i < pipesRef.current.length; i++) {
        const pipe = pipesRef.current[i];
        pipe.x -= pipeSpeed;

        const bottomPipeY = pipe.topHeight + pipe.gap;
        const bottomPipeHeight = CANVAS_HEIGHT - GROUND_HEIGHT - bottomPipeY;

        // Bounding box collision detection with upper pipe
        const inPipeXRange =
          BIRD_X + BIRD_RADIUS - 3 > pipe.x &&
          BIRD_X - BIRD_RADIUS + 3 < pipe.x + PIPE_WIDTH;

        const hitUpperPipe = inPipeXRange && birdYRef.current - BIRD_RADIUS + 4 < pipe.topHeight;
        const hitLowerPipe = inPipeXRange && birdYRef.current + BIRD_RADIUS - 4 > bottomPipeY;

        if (hitUpperPipe || hitLowerPipe) {
          play('hit');
          triggerCrashParticles(BIRD_X, birdYRef.current);
          setIsGameOver(true);
          return;
        }

        // Score increment when passing pipe
        if (!pipe.passed && pipe.x + PIPE_WIDTH < BIRD_X) {
          pipe.passed = true;
          scoreRef.current += 1;
          setScore(scoreRef.current);
          play('score');
        }
      }

      // Remove off-screen pipes
      pipesRef.current = pipesRef.current.filter(p => p.x + PIPE_WIDTH > -20);

      // Update particle burst
      particlesRef.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.03;
      });
      particlesRef.current = particlesRef.current.filter(p => p.alpha > 0);

      // --- 5. RENDER CANVAS ---
      renderScene(ctx);

      reqIdRef.current = requestAnimationFrame(loop);
    };

    const triggerCrashParticles = (x: number, y: number) => {
      const colors = ['#f59e0b', '#ef4444', '#facc15', '#38bdf8', '#ffffff'];
      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 1;
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: colors[Math.floor(Math.random() * colors.length)],
          radius: Math.random() * 3 + 2,
          alpha: 1,
        });
      }
    };

    reqIdRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(reqIdRef.current);
  }, [hasStarted, isPaused, isGameOver, play]);

  // Pure canvas scene rendering
  const renderScene = (ctx: CanvasRenderingContext2D) => {
    // A. Sky Backdrop with gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    skyGrad.addColorStop(0, '#0f172a'); // Night sky top
    skyGrad.addColorStop(0.7, '#1e293b');
    skyGrad.addColorStop(1, '#090d16');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // B. Distant City Skyline Silhouettes
    ctx.fillStyle = '#162032';
    const buildings = [
      { x: 10, w: 45, h: 100 },
      { x: 65, w: 35, h: 140 },
      { x: 110, w: 55, h: 90 },
      { x: 175, w: 40, h: 160 },
      { x: 225, w: 50, h: 110 },
      { x: 285, w: 35, h: 130 },
      { x: 330, w: 45, h: 80 },
    ];
    buildings.forEach(b => {
      ctx.fillRect(b.x, CANVAS_HEIGHT - GROUND_HEIGHT - b.h, b.w, b.h);
    });

    // C. Glowing Pipes
    pipesRef.current.forEach(p => {
      const bottomY = p.topHeight + p.gap;
      const bottomHeight = CANVAS_HEIGHT - GROUND_HEIGHT - bottomY;

      // Upper Pipe Body
      ctx.save();
      const upperGrad = ctx.createLinearGradient(p.x, 0, p.x + PIPE_WIDTH, 0);
      upperGrad.addColorStop(0, '#15803d');
      upperGrad.addColorStop(0.4, '#22c55e');
      upperGrad.addColorStop(0.8, '#4ade80');
      upperGrad.addColorStop(1, '#166534');
      ctx.fillStyle = upperGrad;
      ctx.fillRect(p.x, 0, PIPE_WIDTH, p.topHeight);

      // Upper Pipe Lip / Rim
      ctx.fillStyle = '#22c55e';
      ctx.strokeStyle = '#14532d';
      ctx.lineWidth = 2;
      ctx.fillRect(p.x - 3, p.topHeight - 20, PIPE_WIDTH + 6, 20);
      ctx.strokeRect(p.x - 3, p.topHeight - 20, PIPE_WIDTH + 6, 20);

      // Lower Pipe Body
      const lowerGrad = ctx.createLinearGradient(p.x, 0, p.x + PIPE_WIDTH, 0);
      lowerGrad.addColorStop(0, '#15803d');
      lowerGrad.addColorStop(0.4, '#22c55e');
      lowerGrad.addColorStop(0.8, '#4ade80');
      lowerGrad.addColorStop(1, '#166534');
      ctx.fillStyle = lowerGrad;
      ctx.fillRect(p.x, bottomY, PIPE_WIDTH, bottomHeight);

      // Lower Pipe Lip / Rim
      ctx.fillRect(p.x - 3, bottomY, PIPE_WIDTH + 6, 20);
      ctx.strokeRect(p.x - 3, bottomY, PIPE_WIDTH + 6, 20);
      ctx.restore();
    });

    // D. Ground with moving hazard stripes
    const groundY = CANVAS_HEIGHT - GROUND_HEIGHT;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, groundY, CANVAS_WIDTH, GROUND_HEIGHT);

    // Green grass trim on ground
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(0, groundY, CANVAS_WIDTH, 8);

    // Moving diagonal stripes on ground
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 4;
    for (let x = -30 - groundOffsetRef.current; x < CANVAS_WIDTH + 30; x += 22) {
      ctx.beginPath();
      ctx.moveTo(x, groundY + 8);
      ctx.lineTo(x - 12, CANVAS_HEIGHT);
      ctx.stroke();
    }

    // E. Particles
    particlesRef.current.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // F. Draw Animated Bird
    ctx.save();
    ctx.translate(BIRD_X, birdYRef.current);
    ctx.rotate(rotationRef.current);

    // Body (Vibrant Golden Yellow with shadow)
    ctx.fillStyle = '#facc15';
    ctx.shadowColor = 'rgba(250, 204, 21, 0.4)';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(0, 0, BIRD_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Belly highlight
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(-2, 2, BIRD_RADIUS * 0.75, 0, Math.PI * 2);
    ctx.fill();

    // Eye (Large white with dark pupil)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(6, -4, 5.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(8, -4, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Orange Beak
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(11, -1);
    ctx.lineTo(19, 2);
    ctx.lineTo(11, 6);
    ctx.closePath();
    ctx.fill();

    // Animated Flapping Wing
    const wingY = wingPhaseRef.current * 4;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(-6, wingY, 7, 4.5, -0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // G. Live In-Canvas Big Arcade Score
    if (hasStarted && !isGameOver) {
      ctx.save();
      ctx.font = 'bold 36px "JetBrains Mono", monospace';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 8;
      ctx.textAlign = 'center';
      ctx.fillText(scoreRef.current.toString(), CANVAS_WIDTH / 2, 70);
      ctx.restore();
    }
  };

  return (
    <GameWrapper
      game={game}
      score={score}
      isGameOver={isGameOver}
      isPaused={isPaused}
      onPauseToggle={() => setIsPaused(p => !p)}
      onRestart={resetGame}
      gameOverDetails={`Your bird threaded through ${score} pipe gates!`}
    >
      <div 
        className="relative flex flex-col items-center justify-center w-full select-none cursor-pointer"
        onClick={jump}
      >
        <div className="relative p-2 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="w-[300px] h-[395px] sm:w-[360px] sm:h-[475px] rounded-xl block max-w-full"
          />

          {/* Start Screen Overlay */}
          {!hasStarted && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center z-10">
              <div className="text-5xl mb-3 animate-bounce">🐦</div>
              <h3 className="text-2xl font-black text-white mb-2">Flappy Bird</h3>
              <p className="text-xs text-slate-400 mb-6 max-w-xs">
                Press Spacebar or tap the screen to flap wings, defy gravity, and glide through pipes!
              </p>
              <button
                onClick={(e) => { e.stopPropagation(); resetGame(); }}
                className="py-3 px-8 rounded-xl font-bold text-white bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 shadow-lg shadow-amber-500/25 active:scale-95 transition-all flex items-center gap-2"
              >
                <Play className="w-5 h-5 fill-white" />
                Start Flight
              </button>
            </div>
          )}
        </div>

        {/* Tap/Space instruction indicator */}
        <div className="mt-3 text-xs text-slate-400 flex items-center gap-2 font-medium">
          <span>Tap anywhere or press Space to jump</span>
        </div>
      </div>
    </GameWrapper>
  );
};
