import React, { useState } from 'react';
import { Status } from '../types';
import { Sword, Shield, Timer, Footprints, Star, Smile } from 'lucide-react';

interface LevelUpPopupProps {
  stats: Status[];
  onDistribute: (statKey: string) => void;
  remainingPoints: number;
  onClose: () => void;
}

export function LevelUpPopup({ stats, onDistribute, remainingPoints, onClose }: LevelUpPopupProps) {
  // Only show character stats (skip level, health, energy, dmg, def)
  const characterStats = stats.slice(5);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-black border border-[#33ff33] p-8 rounded-lg max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl text-[#33ff33] mb-2">Level Up!</h2>
          <p className="text-[#33ff33]/80">
            Remaining skill points: <span className="font-bold">{remainingPoints}</span>
          </p>
        </div>

        <div className="space-y-4">
          {characterStats.map((stat) => (
            <div key={stat.key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {stat.icon}
                <span className="text-sm uppercase">{stat.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">{stat.value}</span>
                <button
                  onClick={() => onDistribute(stat.key)}
                  disabled={remainingPoints === 0}
                  className="px-2 py-1 border border-[#33ff33] rounded hover:bg-[#33ff33]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        {remainingPoints === 0 && (
          <button
            onClick={onClose}
            className="mt-6 w-full py-2 border border-[#33ff33] rounded hover:bg-[#33ff33]/10 transition-colors"
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}