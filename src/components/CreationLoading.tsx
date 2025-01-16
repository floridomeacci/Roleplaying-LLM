import React, { useState, useEffect } from 'react';

interface CreationLoadingProps {
  onComplete: () => void;
}

const LOADING_STEPS = [
  'Processing unique path words',
  'Generating stats and profile',
  'Crafting backstory and mission',
  'Generating inventory',
  'Visualising PFP based on profile',
  'Generating...'
];

export function CreationLoading({ onComplete }: CreationLoadingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Blink cursor effect
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);

    // Progress through steps
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev === LOADING_STEPS.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 5000); // Change interval to 5 seconds

    return () => {
      clearInterval(cursorInterval);
      clearInterval(stepInterval);
    };
  }, []);

  // Watch for completion
  useEffect(() => {
    if (isComplete) {
      setCurrentStep(prev => prev + 1);
      setTimeout(onComplete, 2000);
    }
  }, [isComplete]);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50 font-mono">
      <div className="space-y-2">
        {[...LOADING_STEPS, isComplete ? 'Generation complete' : null].filter(Boolean).map((step, index) => {
          if (index > currentStep) return null;
          
          return (
            <div 
              key={index}
              className={`flex items-center gap-2 ${
                index === currentStep ? 'text-[#33ff33]' : 'text-[#33ff33]/50'
              }`}
            >
              <span className="select-none">$</span>
              <span>{step}</span>
              {index === currentStep && (
                <span className={`w-2 h-4 bg-[#33ff33] ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}