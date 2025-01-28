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
      // Si deseas pausar al desmontar, se hace aquí.
      // Pero para evitar el error de “interrupted by a call to pause()”,
      // lo encapsulamos en un try/catch o lo removemos si no es necesario.
      try {
        audioRef.current.pause();
      } catch (err) {
        console.warn('Audio pause interrupted:', err);
      }
    };
  }, [src, options.loop]);

  const play = async () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      try {
        await audioRef.current.play();
      } catch (err) {
        console.warn('Audio play was interrupted:', err);
      }
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  return play;
};

export default useSound;
