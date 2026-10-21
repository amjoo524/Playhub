import { useCallback } from 'react';
import { sound } from '../utils/soundEngine';

export function useSound() {
  const play = useCallback((type: 'click' | 'move' | 'eat' | 'score' | 'flip' | 'combo' | 'levelup' | 'gameover' | 'win' | 'hit' | 'flag' | 'rotate') => {
    sound.play(type);
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    sound.setMuted(muted);
  }, []);

  const isMuted = useCallback(() => {
    return sound.isMuted();
  }, []);

  return { play, setMuted, isMuted };
}
