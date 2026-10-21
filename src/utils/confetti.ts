import confetti from 'canvas-confetti';

export function fireCelebrationConfetti() {
  try {
    // Left burst
    confetti({
      particleCount: 60,
      angle: 60,
      spread: 55,
      origin: { x: 0.1, y: 0.7 },
      colors: ['#a855f7', '#06b6d4', '#ec4899', '#eab308', '#22c55e'],
    });
    // Right burst
    confetti({
      particleCount: 60,
      angle: 120,
      spread: 55,
      origin: { x: 0.9, y: 0.7 },
      colors: ['#a855f7', '#06b6d4', '#ec4899', '#eab308', '#22c55e'],
    });
  } catch {
    // Graceful fallback
  }
}

export function fireLevelUpConfetti() {
  try {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#fbbf24', '#f59e0b', '#8b5cf6', '#06b6d4'],
    });
  } catch {
    // Graceful fallback
  }
}
