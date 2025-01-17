import React, { useEffect, useRef, useState } from 'react';
import wordList from '../data/wordLists.json';

function getRandomWord(): string {
  const randomIndex = Math.floor(Math.random() * wordList.length);
  return wordList[randomIndex].charAt(0).toUpperCase() + wordList[randomIndex].slice(1);
}

interface SlotMachineProps {
  onComplete: (result: string) => void;
  onSpinStart?: () => void;
  onSpinEnd?: () => void;
}

export function SlotMachine({ onComplete, onSpinStart, onSpinEnd }: SlotMachineProps) {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string[]>(['?', '?', '?', '?']);
  const [isButtonLocked, setIsButtonLocked] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const spinTimeouts = useRef<NodeJS.Timeout[]>([]);
  const finalWords = useRef<string[]>([]);

  const spinReel = async (reelIndex: number) => {
    const duration = 2000 + (reelIndex * 500); // Each reel spins longer than the previous
    const interval = 50; // Time between word changes
    let elapsed = 0;
    
    const updateReel = () => {
      if (elapsed < duration) {
        setResult(prev => {
          const newResult = [...prev]; 
          newResult[reelIndex] = getRandomWord();
          return newResult;
        });
        
        elapsed += interval;
        spinTimeouts.current.push(setTimeout(updateReel, interval));
      } else {
        // Use pre-fetched word
        setResult(prev => {
          const newResult = [...prev];
          newResult[reelIndex] = finalWords.current[reelIndex];
          return newResult;
        });
        
        // If this is the last reel, complete the spin
        if (reelIndex === 3) {
          setSpinning(false);
          setShowFlash(true);
          setTimeout(() => {
            setShowFlash(false);
            onSpinEnd?.();
            onComplete(finalWords.current.join(' '));
          }, 1000); // Flash for 1 second before transitioning
        }
      }
    };
    
    updateReel();
  };

  const spin = () => {
    if (spinning || isButtonLocked) return;
    
    // Lock the button permanently
    setIsButtonLocked(true);
    onSpinStart?.();
    
    // Get random words for final result
    finalWords.current = [
      getRandomWord(),
      getRandomWord(),
      getRandomWord(),
      getRandomWord()
    ];
    
    setSpinning(true);
    
    // Clear any existing timeouts
    spinTimeouts.current.forEach(clearTimeout);
    spinTimeouts.current = [];
    
    // Spin each reel
    [0, 1, 2, 3].forEach(index => {
      spinReel(index);
    });
  };

  useEffect(() => {
    // Cleanup timeouts on unmount
    return () => {
      spinTimeouts.current.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-2 p-4 bg-black border border-[#33ff33] rounded-lg">
        {result.map((word, index) => (
          <div
            key={index}
            className={`w-32 h-16 flex items-center justify-center border border-[#33ff33]/20 rounded bg-black/50 overflow-hidden transition-all duration-300 font-mono ${spinning ? 'animate-pulse' : ''} ${
              showFlash ? 'text-white animate-fade-out' : ''
            }`}
          >
            <div className="text-lg whitespace-nowrap overflow-hidden text-ellipsis px-2 font-mono">{word}</div>
          </div>
        ))}
      </div>
      
      <button
        onClick={spin}
        disabled={spinning || isButtonLocked}
        className={`px-6 py-2 border border-[#33ff33] rounded transition-colors ${
          spinning || isButtonLocked 
            ? 'opacity-50 cursor-not-allowed bg-[#33ff33]/5' 
            : 'hover:bg-[#33ff33]/10'
        }`}
      >
        {spinning ? 'Spinning...' : isButtonLocked ? 'Lever Pulled' : 'Pull the Lever'}
      </button>
    </div>
  );
}