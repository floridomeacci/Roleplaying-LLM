import React, { useState } from 'react';
import { generateName, PATH_GENERATION_PROMPT, SPECIALIZATION_PROMPT } from '../characterCreation';
import { Dice } from './Dice';
import { SlotMachine } from './SlotMachine';

interface OnboardingProps {
  onCharacterCreated: (characterData: {
    path: string;
    special: string;
    name: string;
  }) => void;
}

export function Onboarding({ onCharacterCreated }: OnboardingProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [generatedPath, setGeneratedPath] = useState('');
  const [characterName, setCharacterName] = useState(generateName());
  
  const handlePathGenerated = (path: string) => {
    setGeneratedPath(path);
    setStep(2);
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (generatedPath && characterName.trim()) {
      onCharacterCreated({
        path: generatedPath,
        name: characterName
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="bg-black p-8 max-w-4xl w-full mx-4 relative">
        {step === 1 && (
          <SlotMachine onComplete={handlePathGenerated} />
        )}

        {step === 2 && (
          <form onSubmit={handleNameSubmit} className="space-y-4 max-w-lg mx-auto">
            <div className="text-center mb-6">
              <div className="text-xl font-bold text-[#33ff33]">{generatedPath}</div>
            </div>
            <div className="relative">
              <input
                type="text"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                placeholder="Enter your character's name"
                className="w-full bg-transparent border border-[#33ff33] rounded px-4 py-2 pr-12 focus:outline-none focus:ring-1 focus:ring-[#33ff33]"
                autoFocus
              />
              <button 
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#33ff33] hover:text-[#33ff33]/80 text-sm px-2"
                onClick={async () => {
                  const name = generateName();
                  setCharacterName(name);
                }}
              >
                ↺
              </button>
            </div>
            <button
              type="submit"
              disabled={!characterName.trim()}
              className="w-full py-3 px-4 border border-[#33ff33] rounded hover:bg-[#33ff33]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Begin Your Journey
            </button>
          </form>
        )}
      </div>
    </div>
  );
}