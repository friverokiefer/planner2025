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
      audioRef.current.pause();
    };
  }, [src, options.loop]);

  const play = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
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
