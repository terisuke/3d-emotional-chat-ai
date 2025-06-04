
import React, { useRef, useEffect, memo } from 'react';
import { Emotion } from '../types';
import { EmotionalCharacter } from '../services/threeCharacter';

interface CharacterDisplayProps {
  currentEmotion: Emotion;
}

const CharacterDisplay: React.FC<CharacterDisplayProps> = ({ currentEmotion }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const characterInstanceRef = useRef<EmotionalCharacter | null>(null); // Renamed to avoid conflict with class name

  useEffect(() => {
    if (mountRef.current && !characterInstanceRef.current) {
      characterInstanceRef.current = new EmotionalCharacter(mountRef.current);
    }
    
    // Cleanup on unmount
    return () => {
      if (characterInstanceRef.current) {
        characterInstanceRef.current.dispose();
        characterInstanceRef.current = null;
      }
      // Ensure canvas is removed if not handled by dispose. Usually React handles child DOM elements.
      if (mountRef.current) {
         while (mountRef.current.firstChild) {
            mountRef.current.removeChild(mountRef.current.firstChild);
        }
      }
    };
  }, []); // Empty dependency array: run once on mount and cleanup on unmount

  useEffect(() => {
    if (characterInstanceRef.current) {
      characterInstanceRef.current.updateCurrentEmotion(currentEmotion);
    }
  }, [currentEmotion]);

  return <div ref={mountRef} className="w-full h-full rounded-lg" />;
};

export default memo(CharacterDisplay);
