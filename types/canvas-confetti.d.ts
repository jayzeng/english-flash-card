declare module 'canvas-confetti' {
  interface ConfettiConfig {
    angle?: number;
    spread?: number;
    startVelocity?: number;
    decay?: number;
    gravity?: number;
    drift?: number;
    ticks?: number;
    particleCount?: number;
    origin?: {
      x?: number;
      y?: number;
    };
    colors?: string[];
    shapes?: ('square' | 'circle')[];
    scalar?: number;
    zIndex?: number;
    disableForReducedMotion?: boolean;
  }

  function confetti(config?: ConfettiConfig): Promise<null>;
  
  namespace confetti {
    function reset(): void;
  }

  export = confetti;
} 