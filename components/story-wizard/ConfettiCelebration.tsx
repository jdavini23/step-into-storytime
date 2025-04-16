import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiCelebrationProps {
  active: boolean;
  onComplete?: () => void;
}

const ConfettiCelebration: React.FC<ConfettiCelebrationProps> = ({ active, onComplete }) => {
  const animationRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (active && canvasRef.current) {
      const myConfetti = confetti.create(canvasRef.current, { resize: true, useWorker: true });
      let count = 0;
      const shoot = () => {
        myConfetti({
          particleCount: 120,
          spread: 100,
          origin: { y: 0.6 },
        });
        count++;
        if (count < 3) {
          animationRef.current = window.setTimeout(shoot, 400);
        } else if (onComplete) {
          setTimeout(onComplete, 1800);
        }
      };
      shoot();
    }
    return () => {
      if (animationRef.current) window.clearTimeout(animationRef.current);
    };
  }, [active, onComplete]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999] w-screen h-screen"
      aria-hidden="true"
      tabIndex={-1}
    />
  );
};

export default ConfettiCelebration;
