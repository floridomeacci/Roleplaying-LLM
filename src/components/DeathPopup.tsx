import React from 'react';

interface DeathPopupProps {
  onReset: () => void;
}

export function DeathPopup({ onReset }: DeathPopupProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-black border border-red-500 p-8 rounded-lg max-w-md w-full mx-4 text-center">
        <h2 className="text-2xl text-red-500 mb-4">You Died</h2>
        <p className="text-[#33ff33] mb-6">Your journey has come to an end...</p>
        <button
          onClick={onReset}
          className="px-6 py-2 border border-red-500 text-red-500 rounded hover:bg-red-500/10 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}