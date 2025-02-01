// frontend/src/hooks/useSound.js
import { useEffect, useRef } from 'react';

const useSound = (src, options = {}) => {
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio(src);

    if (options.loop) {
      audioRef.current.loop = true;
    }

    return () => {
      // Pausar el audio cuando el componente se desmonta o cambia la fuente
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [src, options.loop]);

  const play = async () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // Reiniciar el audio al principio
      try {
        await audioRef.current.play();
      } catch (err) {
        console.warn('Audio play was interrupted:', err);
      }
    }
  };

  return play; // Solo devolvemos la función play
};

export default useSound;