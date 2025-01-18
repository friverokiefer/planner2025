// frontend/src/hooks/useSound.js
import { useCallback } from 'react';

const useSound = (url) => {
  const play = useCallback(() => {
    const audio = new Audio(url);
    audio.play().catch((error) => {
      console.error('Error al reproducir el sonido:', error);
    });
  }, [url]);

  return play;
};

export default useSound;
